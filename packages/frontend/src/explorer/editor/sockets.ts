import {
  Colors,
  ConnectionInstance,
  DataType,
  SocketDef,
  SocketInstance,
  SocketState,
  SocketType
} from '@masterthesis/shared';
import * as Konva from 'konva';

import { showNotificationWithIcon } from '../../utils/form';
import { ExplorerEditorProps, ExplorerEditorState } from '../ExplorerEditor';
import { socketColors } from '../nodes/sockets';
import { NODE_WIDTH } from './nodes';

export const SOCKET_RADIUS = 8;
export const SOCKET_DISTANCE = 30;

export const getSocketId = (type: SocketType, nodeId: string, name: string) =>
  `${type === SocketType.INPUT ? 'in' : 'out'}-${nodeId}-${name}`;

const renderSocket = (
  s: SocketDef,
  type: SocketType,
  i: number,
  isConnected: boolean,
  onClick: () => void
) => {
  const socketGroup = new Konva.Group({
    x: 0,
    y: i * SOCKET_DISTANCE
  });
  const text = new Konva.Text({
    fill: Colors.GrayDark,
    text: s.displayName,
    fontStyle: s.state === SocketState.DYNAMIC ? 'italic' : undefined,
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
    fill: isConnected ? col : Colors.White,
    stroke: col,
    strokeEnabled: !isConnected,
    strokeWidth: 3,
    radius: SOCKET_RADIUS
  });

  socket.on('mousedown', onClick);
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
) =>
  changeState({
    openConnection: {
      dataType: s.dataType,
      destinations:
        type === SocketType.INPUT ? [{ name: socketName, nodeId }] : null,
      sources: type !== SocketType.INPUT ? [{ name: socketName, nodeId }] : null
    }
  });

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
  const sources =
    type === SocketType.INPUT ? existingConnections.map(c => c.from!) : null;

  if (!sources) {
    return;
  }

  const destinations =
    type !== SocketType.INPUT ? existingConnections.map(c => c.to!) : null;

  changeState({
    openConnection: {
      dataType: s.dataType,
      destinations,
      sources
    }
  });
};

export const onClickSocket = async (
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
    const connectionsInSocket = getConnectionsInSocket(
      connections,
      type,
      nodeId,
      socketName
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

    return;
  }

  if (s.dataType !== DataType.ANY && s.dataType !== openConnection.dataType) {
    handleDifferentDataTypes();
    return;
  }

  if (
    type === SocketType.INPUT
      ? openConnection.destinations !== null
      : openConnection.sources !== null
  ) {
    handleNotAllowedConnection();
    return;
  }

  if (
    type === SocketType.INPUT &&
    connections.filter(
      c => c.to && c.to.nodeId === nodeId && c.to.name === socketName
    ).length > 0
  ) {
    handleMultipleInputs();
    return;
  }

  await Promise.all(
    mapToDestinationConnections(openConnection.destinations, nodeId, socketName)
      .concat(
        mapToSourceConnections(openConnection.sources, nodeId, socketName)
      )
      .filter(c => c.to !== null && c.from !== null)
      .map(c => {
        server.onConnectionCreate(c.from!, c.to!);
      })
  );

  changeState({
    openConnection: null
  });
};

const mapToDestinationConnections = (
  destinations: Array<SocketInstance> | null,
  nodeId: string,
  socketName: string
) =>
  destinations
    ? destinations.map(c => ({
        to: { nodeId: c.nodeId, name: c.name },
        from: { nodeId, name: socketName }
      }))
    : [];

const mapToSourceConnections = (
  sources: Array<SocketInstance> | null,
  nodeId: string,
  socketName: string
) =>
  sources
    ? sources.map(c => ({
        to: { nodeId, name: socketName },
        from: { nodeId: c.nodeId, name: c.name }
      }))
    : [];

const handleMultipleInputs = () => {
  showNotificationWithIcon({
    title: 'Connection not allowed',
    icon: 'warning',
    content: 'Multiple inputs are not possible.'
  });
};

const handleDifferentDataTypes = () => {
  showNotificationWithIcon({
    title: 'Connection not allowed',
    icon: 'warning',
    content: 'Connections between different data types are not supported.'
  });
};

const handleNotAllowedConnection = () => {
  showNotificationWithIcon({
    title: 'Connection not allowed',
    icon: 'warning',
    content: 'Connections only between inputs or outputs are not possible.'
  });
};

const getConnectionsInSocket = (
  connections: Array<ConnectionInstance>,
  type: SocketType,
  nodeId: string,
  socketName: string
) =>
  connections.filter(
    c =>
      type === SocketType.OUTPUT
        ? c.from !== null &&
          c.from.nodeId === nodeId &&
          c.from.name === socketName
        : c.to !== null && c.to.nodeId === nodeId && c.to.name === socketName
  );
