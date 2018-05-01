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
    const socketsMap: Map<string, Konva.Circle> = new Map();

    nodes.forEach(n => {
      const nodeType = nodeTypes.get(n.type);
      if (!nodeType) {
        throw new Error('Unknown node type');
      }

      const { inputs, outputs, title } = nodeType;
      if (!outputs) {
        console.log('Wrong');
        return;
      }

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
        const text = new Konva.Text({
          fill: '#666',
          text: i.name,
          align: 'left',
          width: NODE_WIDTH,
          x: SOCKET_RADIUS * 2,
          y: -SOCKET_RADIUS / 2
        });
        const socket = new Konva.Circle({
          fill: i.color,
          radius: SOCKET_RADIUS
        });
        inputsGroup.add(text);
        inputsGroup.add(socket);
        socketsMap.set(`in-${n.id}-${i.name}`, socket);
      });

      const outputsGroup = new Konva.Group({
        x: NODE_WIDTH,
        y: SOCKET_DISTANCE + TEXT_HEIGHT
      });
      outputs.forEach(i => {
        const text = new Konva.Text({
          fill: '#666',
          text: i.name,
          align: 'right',
          width: NODE_WIDTH,
          x: -NODE_WIDTH - SOCKET_RADIUS * 2,
          y: -SOCKET_RADIUS / 2
        });
        const socket = new Konva.Circle({
          fill: i.color,
          radius: SOCKET_RADIUS
        });
        outputsGroup.add(text);
        outputsGroup.add(socket);
        socketsMap.set(`out-${n.id}-${i.name}`, socket);
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
        `out-${c.from.nodeId}-${c.from.socketName}`
      );
      const inputSocket = socketsMap.get(
        `in-${c.to.nodeId}-${c.to.socketName}`
      );
      if (!outputSocket || !inputSocket) {
        throw new Error('Socket not found!');
      }

      const line = new Konva.Line({
        strokeWidth: 3,
        strokeEnabled: true,
        stroke: '#666',
        points: [
          outputSocket.getAbsolutePosition().x,
          outputSocket.getAbsolutePosition().y,
          inputSocket.getAbsolutePosition().x,
          inputSocket.getAbsolutePosition().y
        ]
      });

      function adjustPoint(e) {
        if (!outputSocket || !inputSocket) {
          return;
        }

        const p = [
          outputSocket.getAbsolutePosition().x,
          outputSocket.getAbsolutePosition().y,
          inputSocket.getAbsolutePosition().x,
          inputSocket.getAbsolutePosition().y
        ];
        line.points(p);
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
