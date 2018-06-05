import { NodeDef } from '../nodes';
import { BooleanSocket, StringSocket } from '../sockets';

export interface BooleanInputNodeOutputs {
  value: boolean;
}

export interface BooleanInputNodeForm {
  value: boolean;
}

export const BooleanInputNodeDef: NodeDef<{}, BooleanInputNodeOutputs> = {
  name: 'Boolean Input',
  inputs: {},
  outputs: {
    value: BooleanSocket('Boolean')
  },
  keywords: [],
  path: ['Boolean']
};

export interface EqualsStringNodeInputs {
  valueA: string;
  valueB: string;
}

export interface EqualsStringNodeOutputs {
  equals: boolean;
}

export const EqualsStringNodeDef: NodeDef<
  EqualsStringNodeInputs,
  EqualsStringNodeOutputs
> = {
  name: 'Equals String',
  inputs: {
    valueA: StringSocket('Value A'),
    valueB: StringSocket('Value B')
  },
  outputs: {
    equals: BooleanSocket('Equals')
  },
  keywords: [],
  path: ['Boolean', 'Comparisons']
};
