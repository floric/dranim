import { NodeDef } from '../nodes';
import { StringSocket } from '../sockets';

export interface StringInputNodeOutputs {
  string: string;
}

export interface StringInputNodeForm {
  value: string;
}

export const StringInputNodeDef: NodeDef<{}, StringInputNodeOutputs> = {
  name: 'String Input',
  inputs: {},
  outputs: {
    string: StringSocket('String')
  },
  keywords: [],
  path: ['String']
};

export interface StringOutputNodeInputs {
  string: string;
}

export interface StringOutputNodeResults {
  value: string;
}

export const StringOutputNodeDef: NodeDef<StringOutputNodeInputs, {}> = {
  name: 'String Output',
  inputs: {
    string: StringSocket('String')
  },
  isOutputNode: true,
  outputs: {},
  keywords: [],
  path: ['String']
};
