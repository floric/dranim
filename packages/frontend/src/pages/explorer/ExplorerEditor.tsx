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

const nodeTypes: Map<string, NodeOptions> = new Map([
  ['DatasetInputNode', DatasetInputNode],
  ['DatasetSelectValuesNode', DatasetSelectValuesNode],
  ['NumberInputNode', NumberInputNode],
  ['StringInputNode', StringInputNode]
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
  from: { nodeId: string; socketName: string };
  to: { nodeId: string; socketName: string };
}

export interface ExplorerEditorProps {
  datasets: Array<Dataset>;
  nodes: Array<NodeDef>;
  connections: Array<ConnectionDef>;
}

const createSocket = (s: Socket, type: 'output' | 'input') => {
  const socketGroup = new Konva.Group();
  const text = new Konva.Text({
    fill: '#666',
    text: s.name,
    align: type === 'input' ? 'left' : 'right',
    width: NODE_WIDTH,
    x: type === 'input' ? SOCKET_RADIUS * 2 : -NODE_WIDTH - SOCKET_RADIUS * 2,
    y: -SOCKET_RADIUS / 2
  });
  const socket = new Konva.Circle({
    fill: s.color,
    radius: SOCKET_RADIUS
  });
  socketGroup.add(text);
  socketGroup.add(socket);
  return socketGroup;
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

export class ExplorerEditor extends React.Component<ExplorerEditorProps> {
  public componentDidMount() {
    const { nodes, connections } = this.props;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    const stage = new Konva.Stage({
      container: EXPLORER_CONTAINER,
      width: canvasWidth,
      height: canvasHeight
    });

    const layer = new Konva.Layer();

    const nodeMap: Map<string, Konva.Group> = new Map();
    const socketsMap: Map<string, Konva.Group> = new Map();

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
      inputs.forEach(i => {
        const socket = createSocket(i, 'input');
        inputsGroup.add(socket);
        socketsMap.set(getSocketId('input', n.id, i.name), socket);
      });

      const outputsGroup = new Konva.Group({
        x: NODE_WIDTH,
        y: SOCKET_DISTANCE + TEXT_HEIGHT
      });
      outputs.forEach(i => {
        const socket = createSocket(i, 'output');
        outputsGroup.add(socket);
        socketsMap.set(getSocketId('output', n.id, i.name), socket);
      });

      nodeGroup.add(bgRect);
      nodeGroup.add(nodeTitle);
      nodeGroup.add(inputsGroup);
      nodeGroup.add(outputsGroup);

      layer.add(nodeGroup);
      nodeMap.set(n.id, nodeGroup);
    });

    connections.forEach(c => {
      const outputSocket = socketsMap.get(
        getSocketId('output', c.from.nodeId, c.from.socketName)
      );
      const inputSocket = socketsMap.get(
        getSocketId('input', c.to.nodeId, c.to.socketName)
      );
      if (!outputSocket || !inputSocket) {
        throw new Error('Socket not found!');
      }

      const line = new Konva.Line({
        strokeWidth: 3,
        strokeEnabled: true,
        stroke: '#666',
        points: getConnectionPoints(
          outputSocket.getAbsolutePosition(),
          inputSocket.getAbsolutePosition()
        ),
        ...({ bezier: true } as any)
      });

      function adjustPoint(e) {
        if (!outputSocket || !inputSocket) {
          return;
        }

        line.points(
          getConnectionPoints(
            outputSocket.getAbsolutePosition(),
            inputSocket.getAbsolutePosition()
          )
        );
        layer.draw();
      }

      nodeMap.get(c.from.nodeId)!.on('dragmove', adjustPoint);
      nodeMap.get(c.to.nodeId)!.on('dragmove', adjustPoint);

      layer.add(line);
    });

    stage.add(layer);
  }

  public render() {
    return (
      <>
        <Card bordered={false} style={{ marginBottom: 12 }}>
          Select one node
        </Card>
        <div
          id={EXPLORER_CONTAINER}
          {...css({ width: '100%', height: '100%' })}
        />
      </>
    );
  }
}
