import {
  ConnectionInstance,
  ConnectionWithoutId,
  SocketDef,
  SocketType
} from '@masterthesis/shared';
import * as Konva from 'konva';

import { showNotificationWithIcon } from '../../utils/form';
import { ExplorerEditorProps, ExplorerEditorState } from '../ExplorerEditor';
import { socketColors } from '../nodes/Sockets';
import { NODE_WIDTH } from './Nodes';

export const SOCKET_RADIUS = 8;
export const SOCKET_DISTANCE = 30;

export const getSocketId = (type: SocketType, nodeId: string, name: string) =>
  `${type === SocketType.INPUT ? 'in' : 'out'}-${nodeId}-${name}`;

const renderSocket = (
  s: SocketDef,
  type: SocketType,
  i: number,
  isConnected: boolean,
  onClick?: () => void
) => {
  const socketGroup = new Konva.Group({
    x: 0,
    y: i * SOCKET_DISTANCE
  });
  const text = new Konva.Text({
    fill: '#666',
    text: s.displayName,
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
      onClick();
    });
  }

  socketGroup.add(text);
  socketGroup.add(socket);
  return socketGroup;
};

export const renderSocketWithUsages = (
  s: SocketDef,
  socketName: string,
  type: SocketType,
  i: number,
  server: ExplorerEditorProps,
  nodeId: string,
  onClick: () => void
) => {
  const { connections } = server;
  const isUsed =
    connections.find(
      c =>
        type === SocketType.INPUT
          ? c.to !== null && c.to.nodeId === nodeId && c.to.name === socketName
          : c.from !== null &&
            c.from.nodeId === nodeId &&
            c.from.name === socketName
    ) !== undefined;
  return renderSocket(s, type, i, isUsed, onClick);
};

const beginNewConnection = (
  nodeId: string,
  s: SocketDef,
  socketName: string,
  type: SocketType,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  changeState({
    openConnection: {
      dataType: s.dataType,
      inputs: type === SocketType.INPUT ? [{ name: socketName, nodeId }] : null,
      outputs: type !== SocketType.INPUT ? [{ name: socketName, nodeId }] : null
    }
  });
};

const beginEditExistingConnection = async (
  connectionsInSocket: Array<ConnectionInstance>,
  s: SocketDef,
  socketName: string,
  type: SocketType,
  nodeId: string,
  server: ExplorerEditorProps,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections } = server;
  const existingConnections = connections.filter(
    c =>
      type === SocketType.INPUT
        ? c.to && c.to.nodeId === nodeId && c.to.name === socketName
        : c.from && c.from.nodeId === nodeId && c.from.name === socketName
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
  s: SocketDef,
  socketName: string,
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
            c.from.name === socketName
          : c.to !== null && c.to.nodeId === nodeId && c.to.name === socketName
    );
    if (connectionsInSocket.length > 0) {
      beginEditExistingConnection(
        connectionsInSocket,
        s,
        socketName,
        type,
        nodeId,
        server,
        changeState
      );
    } else {
      beginNewConnection(nodeId, s, socketName, type, changeState);
    }
  } else {
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
        c => c.to && c.to.nodeId === nodeId && c.to.name === socketName
      ).length > 0
    ) {
      showNotificationWithIcon({
        title: 'Connection not allowed',
        icon: 'warning',
        content: 'Multiple inputs are not possible.'
      });
      return;
    }

    let openConnections: Array<ConnectionWithoutId> = [];
    openConnections = openConnections.concat(
      openConnection.inputs
        ? openConnection.inputs.map(c => ({
            to: { nodeId: c.nodeId, name: c.name },
            from: { nodeId, name: socketName }
          }))
        : []
    );
    openConnections = openConnections.concat(
      openConnection.outputs
        ? openConnection.outputs.map(c => ({
            to: { nodeId, name: socketName },
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
