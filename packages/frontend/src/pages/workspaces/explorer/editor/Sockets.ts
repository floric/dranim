import * as Konva from 'konva';
import {
  ExplorerEditorState,
  ConnectionInstance,
  ExplorerEditorProps
} from '../ExplorerEditor';
import { socketColors } from '../nodes/Sockets';
import { NODE_WIDTH } from './Nodes';
import { showNotificationWithIcon } from '../../../../utils/form';
import { SocketType, Socket } from '@masterthesis/shared';

export const SOCKET_RADIUS = 8;
export const SOCKET_DISTANCE = 30;

export const getSocketId = (type: SocketType, nodeId: string, name: string) =>
  `${type === SocketType.INPUT ? 'in' : 'out'}-${nodeId}-${name}`;

const renderSocket = (
  s: Socket,
  type: SocketType,
  i: number,
  isConnected: boolean,
  onClick?: (s: Socket) => void
) => {
  const socketGroup = new Konva.Group({
    x: 0,
    y: i * SOCKET_DISTANCE
  });
  const text = new Konva.Text({
    fill: '#666',
    text: s.name,
    align: type === SocketType.INPUT ? 'left' : 'right',
    width: NODE_WIDTH / 2,
    x:
      type === SocketType.INPUT
        ? SOCKET_RADIUS * 2
        : -NODE_WIDTH / 2 - SOCKET_RADIUS * 2,
    y: -SOCKET_RADIUS / 2
  });
  const col = socketColors.get(s.dataType);
  const socket = new Konva.Circle({
    fill: isConnected ? col : '#FFF',
    stroke: col,
    strokeEnabled: !isConnected,
    strokeWidth: 3,
    radius: SOCKET_RADIUS
  });

  if (onClick) {
    socket.on('mousedown', () => {
      onClick(s);
    });
  }

  socketGroup.add(text);
  socketGroup.add(socket);
  return socketGroup;
};

export const renderSocketWithUsages = (
  s: Socket,
  type: SocketType,
  i: number,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  nodeId: string,
  changeState: (newState: Partial<ExplorerEditorState>) => void,
  onClick: (s: Socket, nodeId: string) => void
) => {
  const { connections } = server;
  const isUsed =
    connections.find(
      c =>
        type === SocketType.INPUT
          ? c.to !== null && c.to.nodeId === nodeId && c.to.name === s.name
          : c.from !== null &&
            c.from.nodeId === nodeId &&
            c.from.name === s.name
    ) !== undefined;
  return renderSocket(s, type, i, isUsed, socket => onClick(socket, nodeId));
};

const beginNewConnection = (
  nodeId: string,
  s: Socket,
  type: SocketType,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  changeState({
    openConnection: {
      dataType: s.dataType,
      inputs: type === SocketType.INPUT ? [{ name: s.name, nodeId }] : null,
      outputs: type !== SocketType.INPUT ? [{ name: s.name, nodeId }] : null
    }
  });
};

const beginEditExistingConnection = async (
  connectionsInSocket: Array<ConnectionInstance>,
  s: Socket,
  type: SocketType,
  nodeId: string,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections } = server;
  const existingConnections = connections.filter(
    c =>
      type === SocketType.INPUT
        ? c.to && c.to.nodeId === nodeId && c.to.name === s.name
        : c.from && c.from.nodeId === nodeId && c.from.name === s.name
  );
  await Promise.all(
    connectionsInSocket.map(c => server.onConnectionDelete(c.id!))
  );
  changeState({
    openConnection: {
      dataType: s.dataType,
      inputs:
        type !== SocketType.INPUT ? existingConnections.map(c => c.to!) : null,
      outputs:
        type === SocketType.INPUT ? existingConnections.map(c => c.from!) : null
    }
  });
};

export const onClickSocket = (
  s: Socket,
  type: SocketType,
  nodeId: string,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { openConnection } = state;
  const { connections } = server;
  if (openConnection === null) {
    const connectionsInSocket = connections.filter(
      c =>
        type === SocketType.OUTPUT
          ? c.from !== null &&
            c.from.nodeId === nodeId &&
            c.from.name === s.name
          : c.to !== null && c.to.nodeId === nodeId && c.to.name === s.name
    );
    if (connectionsInSocket.length > 0) {
      beginEditExistingConnection(
        connectionsInSocket,
        s,
        type,
        nodeId,
        server,
        state,
        changeState
      );
    } else {
      beginNewConnection(nodeId, s, type, server, state, changeState);
    }
  } else {
    // TODO prevent circles (using ID lists)
    if (s.dataType !== openConnection.dataType) {
      showNotificationWithIcon({
        title: 'Connection not allowed',
        icon: 'warning',
        content: 'Connections between different data types are not supported.'
      });
      return;
    }

    if (
      type === SocketType.INPUT
        ? openConnection.inputs !== null
        : openConnection.outputs !== null
    ) {
      showNotificationWithIcon({
        title: 'Connection not allowed',
        icon: 'warning',
        content: 'Connections only between inputs or outputs are not possible.'
      });
      return;
    }

    if (
      type === SocketType.INPUT &&
      connections.filter(
        c => c.to && c.to.nodeId === nodeId && c.to.name === s.name
      ).length > 0
    ) {
      showNotificationWithIcon({
        title: 'Connection not allowed',
        icon: 'warning',
        content: 'Multiple inputs are not possible.'
      });
      return;
    }

    let openConnections: Array<ConnectionInstance> = [];
    openConnections = openConnections.concat(
      openConnection.inputs
        ? openConnection.inputs.map(c => ({
            to: { nodeId: c.nodeId, name: c.name },
            from: { nodeId, name: s.name }
          }))
        : []
    );
    openConnections = openConnections.concat(
      openConnection.outputs
        ? openConnection.outputs.map(c => ({
            to: { nodeId, name: s.name },
            from: { nodeId: c.nodeId, name: c.name }
          }))
        : []
    );

    openConnections.filter(c => c.to !== null && c.from !== null).forEach(c => {
      server.onConnectionCreate(c.from!, c.to!);
    });

    changeState({
      openConnection: null
    });
  }
};
