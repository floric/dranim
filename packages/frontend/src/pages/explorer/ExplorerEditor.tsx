import * as React from 'react';
import { Card } from 'antd';
import { css } from 'glamor';
import * as Konva from 'konva';

import { Dataset } from '../../utils/model';
import {
  DatasetInputNode,
  DatasetSelectValuesNode
} from './nodes/DatasetNodes';
import {
  NumberInputNode,
  StringInputNode,
  NodeOptions
} from './nodes/BasicNodes';
import { Socket } from './nodes/Sockets';
import { StringLengthNode } from './nodes/StringNodes';
import { showNotificationWithIcon } from '../../utils/form';

const nodeTypes: Map<string, NodeOptions> = new Map([
  ['DatasetInputNode', DatasetInputNode],
  ['DatasetSelectValuesNode', DatasetSelectValuesNode],
  ['NumberInputNode', NumberInputNode],
  ['StringInputNode', StringInputNode],
  ['StringLengthNode', StringLengthNode]
]);

const EXPLORER_CONTAINER = 'explcontainer';
const SOCKET_RADIUS = 8;
const SOCKET_DISTANCE = 30;
const NODE_WIDTH = 200;
const TEXT_HEIGHT = 20;
const CONNECTION_STIFFNESS = 0.7;

export interface NodeDef {
  type: string;
  x: number;
  y: number;
  id: string;
}

export interface ConnectionDef {
  from: { nodeId: string; socketName: string } | null;
  to: { nodeId: string; socketName: string } | null;
}

export interface ExplorerEditorProps {
  datasets: Array<Dataset>;
  nodes: Array<NodeDef>;
  connections: Array<ConnectionDef>;
}

const createSocket = (
  s: Socket,
  isConnected: boolean,
  onClick?: (s: Socket) => void
) => {
  const socketGroup = new Konva.Group();
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
  usages: Set<string>,
  state: ExplorerEditorState,
  nodeId: string,
  changeState: (newState: ExplorerEditorState) => void,
  onClick: (s: Socket, nodeId: string) => void
) => {
  const sId = getSocketId(s.type, nodeId, s.name);
  return createSocket(s, usages.has(sId), socket => onClick(socket, nodeId));
};

const getTypeOfSocket = (
  state: ExplorerEditorState,
  type: 'output' | 'input',
  nodeId: string,
  socketName: string
) => {
  const { nodes } = state;
  const node = nodes.find(n => n.id === nodeId);
  if (!node) {
    throw new Error('Invalid node!');
  }

  const nodeType = nodeTypes.get(node.type);
  if (!nodeType) {
    throw new Error('Invalid nodetype!');
  }

  const socketDef =
    type === 'output'
      ? nodeType.outputs.find(o => o.name === socketName)
      : nodeType.inputs.find(i => i.name === socketName);
  if (!socketDef) {
    console.log(nodeType);
    console.log(socketName);
    throw new Error('Socket not found in type.');
  }

  return socketDef.dataType;
};

const onClickSocket = (
  s: Socket,
  nodeId: string,
  state: ExplorerEditorState,
  changeState: (newState: ExplorerEditorState) => void
) => {
  const { connections, nodes, openConnection } = state;
  if (openConnection === null) {
    const connIndex = connections.findIndex(
      c =>
        s.type === 'output'
          ? c.from !== null &&
            c.from.nodeId === nodeId &&
            c.from.socketName === s.name
          : c.to !== null &&
            c.to.nodeId === nodeId &&
            c.to.socketName === s.name
    );
    if (connIndex >= 0) {
      connections[connIndex] = {
        from: s.type === 'output' ? null : connections[connIndex].from,
        to: s.type === 'input' ? null : connections[connIndex].to
      };
      changeState({
        mode: 'DEFAULT',
        nodes,
        connections,
        openConnection: { dataType: s.dataType }
      });
    }
  } else {
    // is input or output?
    const clickedDatatype = getTypeOfSocket(state, s.type, nodeId, s.name);
    if (clickedDatatype !== openConnection.dataType) {
      showNotificationWithIcon({
        title: 'Connection not allowed',
        icon: 'warning',
        content: 'Connections between different data types are not supported.'
      });
      return;
    }

    const connIndex = connections.findIndex(c => !c.to || !c.from);

    const conn = connections[connIndex];
    if (!conn) {
      throw new Error('Connection not found.');
    }

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

    connections[connIndex] = {
      to:
        s.type === 'input'
          ? { nodeId, socketName: s.name }
          : connections[connIndex].to,
      from:
        s.type === 'output'
          ? { nodeId, socketName: s.name }
          : connections[connIndex].from
    };

    changeState({
      mode: 'DEFAULT',
      nodes,
      connections,
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

const initStage = (
  canvasId: string,
  state,
  changeState: (newState: ExplorerEditorState) => void
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
  const usedSocketsSet: Set<string> = new Set();
  connections.forEach(con => {
    if (con.from) {
      usedSocketsSet.add(
        getSocketId('output', con.from.nodeId, con.from.socketName)
      );
    }
    if (con.to) {
      usedSocketsSet.add(
        getSocketId('input', con.to.nodeId, con.to.socketName)
      );
    }
  });

  nodes.forEach(n => {
    const nodeType = nodeTypes.get(n.type);
    if (!nodeType) {
      throw new Error('Unknown node type');
    }

    const { inputs, outputs, title } = nodeType;
    const minSocketsNr =
      inputs.length > outputs.length ? inputs.length : outputs.length;
    const height = (minSocketsNr + 1) * SOCKET_DISTANCE + TEXT_HEIGHT;

    const nodeGroup = new Konva.Group({ draggable: true, x: n.x, y: n.y });
    const bgRect = new Konva.Rect({
      width: NODE_WIDTH,
      height,
      fill: '#CCC'
    });
    const nodeTitle = new Konva.Text({
      fill: '#000',
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
    for (const i of inputs) {
      const socket = createSocketWithUsages(
        i,
        usedSocketsSet,
        state,
        n.id,
        changeState,
        (s: Socket, nodeId: string) =>
          onClickSocket(s, nodeId, state, changeState)
      );
      inputsGroup.add(socket);
      socketsMap.set(getSocketId('input', n.id, i.name), socket);
    }

    const outputsGroup = new Konva.Group({
      x: NODE_WIDTH,
      y: SOCKET_DISTANCE + TEXT_HEIGHT
    });
    for (const i of outputs) {
      const socket = createSocketWithUsages(
        i,
        usedSocketsSet,
        state,
        n.id,
        changeState,
        (s: Socket, nodeId: string) =>
          onClickSocket(s, nodeId, state, changeState)
      );
      outputsGroup.add(socket);
      socketsMap.set(getSocketId('output', n.id, i.name), socket);
    }

    nodeGroup.add(bgRect);
    nodeGroup.add(nodeTitle);
    nodeGroup.add(inputsGroup);
    nodeGroup.add(outputsGroup);

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

    const line = new Konva.Line({
      strokeWidth: 3,
      strokeEnabled: true,
      stroke: '#666',
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
    }

    connsLayer.add(line);
  }

  stage.add(connsLayer);
  stage.add(nodesLayer);
};

export interface ExplorerEditorState {
  connections: Array<ConnectionDef>;
  nodes: Array<NodeDef>;
  mode: 'DEFAULT';
  openConnection: { dataType: string } | null;
}

export class ExplorerEditor extends React.Component<
  ExplorerEditorProps,
  ExplorerEditorState
> {
  public componentWillMount() {
    this.setState({
      openConnection: null,
      mode: 'DEFAULT',
      connections: this.props.connections,
      nodes: this.props.nodes
    });
  }

  private changeState = (newState: ExplorerEditorState) => {
    this.setState(newState);
    this.updateCanvas();
  };

  public componentDidMount() {
    initStage(EXPLORER_CONTAINER, this.state, this.changeState);
  }

  public updateCanvas() {
    initStage(EXPLORER_CONTAINER, this.state, this.changeState);
  }

  public render() {
    return (
      <>
        <Card bordered={false} style={{ marginBottom: 12 }}>
          Select one node
        </Card>
        <div
          id={EXPLORER_CONTAINER}
          {...css({ width: '100%', height: '800px', border: '1px solid #CCC' })}
        />
      </>
    );
  }
}
