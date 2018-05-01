import * as React from 'react';
import { Rect, Group, Circle, Text } from 'react-konva';
import { Component, RefObject, createRef } from 'react';

import { Input, Output, Socket } from './Sockets';

export interface NodeProps {
  title: string;
  inputs: Array<Input>;
  outputs: Array<Output>;
  nodeId: string;
  x?: number;
  y?: number;
}

const SOCKET_RADIUS = 8;
const SOCKET_DISTANCE = 30;
const NODE_WIDTH = 200;
const TEXT_HEIGHT = 20;

export interface NodeSocketProps {
  socket: Socket;
  align: 'left' | 'right';
  nodeId: string;
}

export class NodeSocket extends Component<NodeSocketProps> {
  public render() {
    const { align, socket } = this.props;
    return (
      <Group>
        <Circle radius={SOCKET_RADIUS} fill={socket.color} />
        <Text
          fill="#666"
          text={socket.name}
          align={align}
          width={NODE_WIDTH}
          x={
            align === 'right'
              ? -NODE_WIDTH - SOCKET_RADIUS * 2
              : SOCKET_RADIUS * 2
          }
          y={-SOCKET_RADIUS / 2}
        />
      </Group>
    );
  }
}

export class Node extends React.Component<NodeProps> {
  private nodeGroupRef: RefObject<Group> = createRef<Group>();
  private socketRefs: Map<string, RefObject<NodeSocket>> = new Map();

  public componentWillMount() {
    const { inputs, outputs, nodeId } = this.props;

    inputs.forEach(i => {
      const socketRef = `in-${nodeId}-${i.name}`;
      this.socketRefs.set(socketRef, createRef<NodeSocket>());
    });

    outputs.forEach(i => {
      const socketRef = `out-${nodeId}-${i.name}`;
      this.socketRefs.set(socketRef, createRef<NodeSocket>());
    });
  }

  public componentDidMount() {
    (this.nodeGroupRef.current! as any).on('xChange', evt => {
      console.log(this.socketRefs);
    });
  }

  public render() {
    const { title, inputs, outputs, x = 0, y = 0, nodeId } = this.props;
    const minSocketsNr =
      inputs.length > outputs.length ? inputs.length : outputs.length;
    const height = (minSocketsNr + 1) * SOCKET_DISTANCE + TEXT_HEIGHT;

    return (
      <Group draggable x={x} y={y} ref={this.nodeGroupRef}>
        <Group>
          <Rect width={NODE_WIDTH} height={height} fill="#CCC" />
        </Group>
        <Group>
          {inputs.map((socket, i) => (
            <Group
              key={`input-${i}`}
              x={0}
              y={(i + 1) * SOCKET_DISTANCE + TEXT_HEIGHT}
            >
              <NodeSocket
                ref={this.socketRefs.get(`in-${nodeId}-${socket.name}`)}
                socket={socket}
                align="left"
                nodeId={nodeId}
              />
            </Group>
          ))}
          {outputs.map((socket, i) => (
            <Group
              key={`output-${i}`}
              x={NODE_WIDTH}
              y={(i + 1) * SOCKET_DISTANCE + TEXT_HEIGHT}
            >
              <NodeSocket
                ref={this.socketRefs.get(`out-${nodeId}-${socket.name}`)}
                socket={socket}
                align="right"
                nodeId={nodeId}
              />
            </Group>
          ))}
        </Group>
        <Group>
          <Text
            fill="black"
            text={title}
            align="center"
            fontStyle="bold"
            height={TEXT_HEIGHT}
            width={NODE_WIDTH}
            y={10}
          />
        </Group>
      </Group>
    );
  }
}
