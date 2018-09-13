import { NodeDef } from '../nodes';
import { StringSocket } from '../sockets';

export interface StringInputNodeOutputs {
  value: string;
}

export interface StringInputNodeForm {
  value: string;
}

export const StringInputNodeDef: NodeDef<{}, StringInputNodeOutputs> = {
  name: 'Input String',
  type: 'StringInput',
  inputs: {},
  outputs: {
    value: StringSocket('String')
  },
  keywords: [],
  path: ['String']
};

export interface StringOutputNodeInputs {
  value: string;
}

export const StringOutputNodeDef: NodeDef<StringOutputNodeInputs, {}> = {
  name: 'Output String',
  type: 'StringOutput',
  inputs: {
    value: StringSocket('String')
  },
  isOutputNode: true,
  outputs: {},
  keywords: [],
  path: ['String']
};
