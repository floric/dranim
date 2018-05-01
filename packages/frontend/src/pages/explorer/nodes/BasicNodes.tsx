import * as React from 'react';
import { SFC } from 'react';

import { Node } from './Node';
import { StringSocket, NumberSocket } from './Sockets';

export interface EditorProps {
  x?: number;
  y?: number;
  nodeId: string;
}

export const NumberInputNode: SFC<EditorProps> = props => (
  <Node
    {...props}
    title="Number Input"
    inputs={[]}
    outputs={[NumberSocket('Number')]}
  />
);

export const StringInputNode: SFC<EditorProps> = props => (
  <Node
    {...props}
    title="String Input"
    inputs={[]}
    outputs={[StringSocket('String')]}
  />
);
