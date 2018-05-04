import * as Konva from 'konva';

import { Socket } from './nodes/Sockets';
import { showNotificationWithIcon } from '../../utils/form';
import { nodeTypes } from './nodes/AllNodes';
import { ExplorerEditorState, ConnectionDef, NodeDef } from './ExplorerEditor';

export const EXPLORER_CONTAINER = 'explcontainer';
export const NODE_WIDTH = 160;
const SOCKET_RADIUS = 8;
const SOCKET_DISTANCE = 30;
const TEXT_HEIGHT = 20;
const CONNECTION_STIFFNESS = 0.7;

const createSocket = (
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

const createSocketWithUsages = (
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
  return createSocket(s, i, isUsed, socket => onClick(socket, nodeId));
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

const onClickSocket = (
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

const getConnectionPoints = (output: Konva.Vector2d, input: Konva.Vector2d) => [
  output.x,
  output.y,
  output.x + Math.abs(input.x - output.x) * CONNECTION_STIFFNESS,
  output.y,
  input.x - Math.abs(input.x - output.x) * CONNECTION_STIFFNESS,
  input.y,
  input.x,
  input.y
];

const getSocketId = (
  type: 'input' | 'output',
  nodeId: string,
  socketName: string
) => `${type === 'input' ? 'in' : 'out'}-${nodeId}-${socketName}`;

const renderNode = (
  n: NodeDef,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void,
  nodeMap: Map<string, Konva.Group>,
  socketsMap: Map<string, Konva.Group>
) => {
  const { nodes } = state;
  const nodeType = nodeTypes.get(n.type);
  if (!nodeType) {
    throw new Error('Unknown node type');
  }

  const { inputs, outputs, title } = nodeType;
  const minSocketsNr =
    inputs.length > outputs.length ? inputs.length : outputs.length;
  const height = (minSocketsNr + 1) * SOCKET_DISTANCE + TEXT_HEIGHT;
  const isSelected = state.selectedNode !== null && state.selectedNode === n.id;

  const nodeGroup = new Konva.Group({ draggable: true, x: n.x, y: n.y });
  nodeGroup.on('dragend', ev => {
    const nodeIndex = nodes.findIndex(node => node.id === n.id);
    nodes[nodeIndex] = {
      id: n.id,
      type: n.type,
      x: ev.target.x(),
      y: ev.target.y()
    };
    changeState({
      nodes
    });
  });
  nodeGroup.on('click', ev => {
    changeState({
      selectedNode: n.id
    });
  });
  const bgRect = new Konva.Rect({
    width: NODE_WIDTH,
    height,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowBlur: 5,
    fill: '#FFF'
  });
  const nodeTitle = new Konva.Text({
    fill: isSelected ? '#1890ff' : '#000',
    align: 'center',
    text: title,
    fontStyle: 'bold',
    height: TEXT_HEIGHT,
    width: NODE_WIDTH,
    y: 10
  });

  const inputsGroup = new Konva.Group({
    x: 0,
    y: SOCKET_DISTANCE + TEXT_HEIGHT
  });
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < inputs.length; ++i) {
    const input = inputs[i];
    const socket = createSocketWithUsages(
      input,
      i,
      state,
      n.id,
      changeState,
      (s: Socket, nodeId: string) =>
        onClickSocket(s, nodeId, state, changeState)
    );
    inputsGroup.add(socket);
    socketsMap.set(getSocketId('input', n.id, input.name), socket);
  }

  const outputsGroup = new Konva.Group({
    x: NODE_WIDTH,
    y: SOCKET_DISTANCE + TEXT_HEIGHT
  });
  for (let i = 0; i < outputs.length; ++i) {
    const output = outputs[i];
    const socket = createSocketWithUsages(
      output,
      i,
      state,
      n.id,
      changeState,
      (s: Socket, nodeId: string) =>
        onClickSocket(s, nodeId, state, changeState)
    );
    outputsGroup.add(socket);
    socketsMap.set(getSocketId('output', n.id, output.name), socket);
  }

  nodeGroup.add(bgRect);
  nodeGroup.add(nodeTitle);
  nodeGroup.add(inputsGroup);
  nodeGroup.add(outputsGroup);

  return nodeGroup;
};

export const updateStage = (
  canvasId: string,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections, nodes } = state;
  const canvasContainer = document.getElementById(EXPLORER_CONTAINER);
  if (!canvasContainer) {
    throw new Error('Canvas container not found.');
  }

  const canvasWidth = canvasContainer.clientWidth;
  const canvasHeight = canvasContainer.clientHeight;

  const stage = new Konva.Stage({
    container: EXPLORER_CONTAINER,
    width: canvasWidth,
    height: canvasHeight
  });

  const nodesLayer = new Konva.Layer();
  const connsLayer = new Konva.Layer();

  const nodeMap: Map<string, Konva.Group> = new Map();
  const socketsMap: Map<string, Konva.Group> = new Map();

  nodes.forEach(n => {
    const nodeGroup = renderNode(n, state, changeState, nodeMap, socketsMap);
    nodesLayer.add(nodeGroup);
    nodeMap.set(n.id, nodeGroup);
  });

  for (const c of connections) {
    const outputSocket = c.from
      ? socketsMap.get(getSocketId('output', c.from.nodeId, c.from.socketName))
      : null;
    const inputSocket = c.to
      ? socketsMap.get(getSocketId('input', c.to.nodeId, c.to.socketName))
      : null;
    const isCurrentlyChanged = !inputSocket || !outputSocket;

    const line = new Konva.Line({
      strokeWidth: isCurrentlyChanged ? 4 : 2,
      strokeEnabled: true,
      stroke: isCurrentlyChanged ? '#666' : '#999',
      points: getConnectionPoints(
        outputSocket
          ? outputSocket.getAbsolutePosition()
          : stage.getPointerPosition() || inputSocket!.getAbsolutePosition(),
        inputSocket
          ? inputSocket.getAbsolutePosition()
          : stage.getPointerPosition() || outputSocket!.getAbsolutePosition()
      ),
      ...({ bezier: true } as any)
    });

    const adjustPoint = e => {
      if (!outputSocket || !inputSocket) {
        return;
      }
      line.points(
        getConnectionPoints(
          outputSocket.getAbsolutePosition(),
          inputSocket.getAbsolutePosition()
        )
      );
      connsLayer.draw();
    };

    if (c.from) {
      nodeMap.get(c.from.nodeId)!.on('dragmove', adjustPoint);
    }
    if (c.to) {
      nodeMap.get(c.to.nodeId)!.on('dragmove', adjustPoint);
    }
    if (!c.to || !c.from) {
      stage.on('mousemove', () => {
        line.points(
          getConnectionPoints(
            outputSocket
              ? outputSocket.getAbsolutePosition()
              : stage.getPointerPosition(),
            inputSocket
              ? inputSocket.getAbsolutePosition()
              : stage.getPointerPosition()
          )
        );
        connsLayer.draw();
      });

      stage.on('mousedown', () => {
        changeState({
          connections: connections.filter(
            con => con.from !== null && con.to !== null
          ),
          openConnection: null
        });
      });
    }

    connsLayer.add(line);
  }

  stage.add(connsLayer);
  stage.add(nodesLayer);
};
