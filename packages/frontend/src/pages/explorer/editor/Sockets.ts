import * as Konva from 'konva';
import { ExplorerEditorState, ConnectionDef } from '../ExplorerEditor';
import { Socket } from '../nodes/Sockets';
import { NODE_WIDTH } from './Nodes';
import { showNotificationWithIcon } from '../../../utils/form';

export const SOCKET_RADIUS = 8;
export const SOCKET_DISTANCE = 30;

export const getSocketId = (
  type: 'input' | 'output',
  nodeId: string,
  socketName: string
) => `${type === 'input' ? 'in' : 'out'}-${nodeId}-${socketName}`;

const renderSocket = (
  s: Socket,
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
    align: s.type === 'input' ? 'left' : 'right',
    width: NODE_WIDTH / 2,
    x:
      s.type === 'input'
        ? SOCKET_RADIUS * 2
        : -NODE_WIDTH / 2 - SOCKET_RADIUS * 2,
    y: -SOCKET_RADIUS / 2
  });
  const socket = new Konva.Circle({
    fill: isConnected ? s.color : '#FFF',
    stroke: s.color,
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
  i: number,
  state: ExplorerEditorState,
  nodeId: string,
  changeState: (newState: ExplorerEditorState) => void,
  onClick: (s: Socket, nodeId: string) => void
) => {
  const isUsed =
    state.connections.find(
      c =>
        s.type === 'input'
          ? c.to !== null &&
            c.to.nodeId === nodeId &&
            c.to.socketName === s.name
          : c.from !== null &&
            c.from.nodeId === nodeId &&
            c.from.socketName === s.name
    ) !== undefined;
  return renderSocket(s, i, isUsed, socket => onClick(socket, nodeId));
};

const createNewConnection = (
  nodeId: string,
  s: Socket,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections } = state;
  changeState({
    connections: [
      ...connections,
      {
        from: s.type === 'input' ? null : { nodeId, socketName: s.name },
        to: s.type === 'input' ? { nodeId, socketName: s.name } : null
      }
    ],
    openConnection: { dataType: s.dataType }
  });
};

const beginEditExistingConnection = (
  connectionsInSocket: Array<ConnectionDef>,
  s: Socket,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections } = state;
  changeState({
    connections: connections.map(
      c =>
        connectionsInSocket.includes(c)
          ? {
              from: s.type === 'output' ? null : c.from,
              to: s.type === 'input' ? null : c.to
            }
          : c
    ),
    openConnection: { dataType: s.dataType }
  });
};

export const onClickSocket = (
  s: Socket,
  nodeId: string,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections, openConnection } = state;
  if (openConnection === null) {
    const connectionsInSocket = connections.filter(
      c =>
        s.type === 'output'
          ? c.from !== null &&
            c.from.nodeId === nodeId &&
            c.from.socketName === s.name
          : c.to !== null &&
            c.to.nodeId === nodeId &&
            c.to.socketName === s.name
    );
    if (connectionsInSocket.length > 0) {
      beginEditExistingConnection(connectionsInSocket, s, state, changeState);
    } else {
      createNewConnection(nodeId, s, state, changeState);
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
      s.type === 'input' &&
      connections.filter(
        c => c.to && c.to.nodeId === nodeId && c.to.socketName === s.name
      ).length > 0
    ) {
      showNotificationWithIcon({
        title: 'Connection not allowed',
        icon: 'warning',
        content: 'Multiple inputs are not possible.'
      });
      return;
    }

    const openConnections = connections.filter(c => !c.to || !c.from);
    openConnections.forEach(conn => {
      const otherNode = s.type === 'input' ? conn.from : conn.to;
      if (!otherNode) {
        showNotificationWithIcon({
          title: 'Connection not allowed',
          icon: 'warning',
          content: `Connections with other ${
            s.type === 'input' ? 'inputs' : 'outputs'
          } not possible.`
        });
        return;
      }

      if (otherNode.nodeId === nodeId) {
        showNotificationWithIcon({
          title: 'Circles not allowed',
          icon: 'warning',
          content: 'Circular dependencies are not allowed.'
        });
        return;
      }
    });

    const newConnections = openConnections.map(c => ({
      to: s.type === 'input' ? { nodeId, socketName: s.name } : c.to,
      from: s.type === 'output' ? { nodeId, socketName: s.name } : c.from
    }));
    newConnections.forEach(c => {
      const matchingConnections = connections.filter(
        existingC =>
          JSON.stringify(existingC.to) === JSON.stringify(c.to) &&
          JSON.stringify(existingC.from) === JSON.stringify(c.from)
      );
      if (matchingConnections.length === 0) {
        connections.push(c);
      }
    });

    changeState({
      connections: connections.filter(c => c.from !== null && c.to !== null),
      openConnection: null
    });
  }
};
