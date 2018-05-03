import { StringSocket, NumberSocket, Socket } from './Sockets';

export interface EditorProps {
  x?: number;
  y?: number;
  nodeId: string;
}

export interface NodeOptions {
  title: string;
  inputs: Array<Socket>;
  outputs: Array<Socket>;
  path: Array<string>;
}

export const NumberInputNode: NodeOptions = {
  title: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number', 'output')],
  path: ['Number']
};

export const StringInputNode: NodeOptions = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String', 'output')],
  path: ['String']
};

export const NumberOutputNode: NodeOptions = {
  title: 'Number Output',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [],
  path: ['Number']
};

export const StringOutputNode: NodeOptions = {
  title: 'String Output',
  inputs: [StringSocket('String', 'input')],
  outputs: [],
  path: ['String']
};

export const AllBasicNodes = [
  NumberInputNode,
  StringInputNode,
  NumberOutputNode,
  StringOutputNode
];
