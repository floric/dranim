import { NodeDef } from '../nodes';
import { StringSocket } from '../sockets';

export interface StringInputNodeOutputs {
  value: string;
}

export interface StringInputNodeForm {
  value: string;
}

export const StringInputNodeDef: NodeDef<{}, StringInputNodeOutputs> = {
  name: 'String Input',
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

export interface StringOutputNodeResults {
  value: string;
}

export const StringOutputNodeDef: NodeDef<StringOutputNodeInputs, {}> = {
  name: 'String Output',
  inputs: {
    value: StringSocket('String')
  },
  isOutputNode: true,
  outputs: {},
  keywords: [],
  path: ['String']
};
