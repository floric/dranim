import { NodeDef } from '../interfaces';
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

export const StringOutputNodeDef: NodeDef<StringOutputNodeInputs, {}> = {
  name: 'String Output',
  inputs: {
    string: StringSocket('String')
  },
  outputs: {},
  keywords: [],
  path: ['String']
};
