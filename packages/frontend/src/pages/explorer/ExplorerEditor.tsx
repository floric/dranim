import * as React from 'react';
import { Card } from 'antd';
import { Stage, Layer, Line } from 'react-konva';

import { Dataset } from '../../utils/model';
import {
  DatasetInputNode,
  DatasetSelectValuesNode
} from './nodes/DatasetNodes';
import { NumberInputNode, StringInputNode } from './nodes/BasicNodes';
import { SFC } from 'react';

const nodeTypes = {
  DatasetInputNode,
  DatasetSelectValuesNode,
  NumberInputNode,
  StringInputNode
};

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

export const Connection: SFC<{ def: ConnectionDef }> = ({ def }) => {
  return (
    <Line
      stroke="#666"
      strokeWidth={2}
      points={[100, 95, 100, 95, 550, 140, 550, 140]}
    />
  );
};

export class ExplorerEditor extends React.Component<ExplorerEditorProps> {
  public render() {
    const { nodes, connections } = this.props;
    console.log(this.refs.stage);
    return (
      <>
        <Card bordered={false} style={{ marginBottom: 12 }}>
          Select one node
        </Card>
        <Stage
          // tslint:disable-next-line:jsx-no-string-ref
          ref="stage"
          width={window.innerWidth}
          height={window.innerHeight}
          onContentClick={() => console.log(this.refs)}
        >
          <Layer>
            {nodes.map(n => {
              const Node = nodeTypes[n.type];
              if (!Node) {
                throw new Error('Unsupported node type');
              }

              return <Node x={n.x} y={n.y} key={n.id} nodeId={n.id} />;
            })}
          </Layer>
          <Layer>
            {connections.map((def, i) => (
              <Connection key={`conn-${i}`} def={def} />
            ))}
          </Layer>
        </Stage>
      </>
    );
  }
}
