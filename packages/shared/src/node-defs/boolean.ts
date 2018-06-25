import { NodeDef } from '../nodes';
import { BooleanSocket, StringSocket } from '../sockets';

export interface BooleanInputNodeOutputs {
  value: boolean;
}

export interface BooleanInputNodeForm {
  value: boolean;
}

export const BooleanInputNodeDef: NodeDef<{}, BooleanInputNodeOutputs> = {
  name: 'Input',
  type: 'BooleanInput',
  inputs: {},
  outputs: {
    value: BooleanSocket('Boolean')
  },
  keywords: [],
  path: ['Boolean']
};

export interface BooleanOutputNodeInputs {
  value: boolean;
}

export const BooleanOutputNodeDef: NodeDef<BooleanOutputNodeInputs, {}> = {
  name: 'Output',
  type: 'BooleanOutput',
  inputs: {
    value: BooleanSocket('Boolean')
  },
  outputs: {},
  keywords: [],
  isOutputNode: true,
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
  type: 'EqualsString',
  inputs: {
    valueA: StringSocket('Value A'),
    valueB: StringSocket('Value B')
  },
  outputs: {
    equals: BooleanSocket('Equals')
  },
  keywords: [],
  path: ['String', 'Comparisons']
};

export interface BooleanOperatorInputs {
  valueA: boolean;
  valueB: boolean;
}

export interface BooleanOperatorOutputs {
  value: boolean;
}

export const AndNodeDef: NodeDef<
  BooleanOperatorInputs,
  BooleanOperatorOutputs
> = {
  name: 'And',
  type: 'And',
  inputs: {
    valueA: BooleanSocket('Value A'),
    valueB: BooleanSocket('Value B')
  },
  outputs: {
    value: BooleanSocket('Result')
  },
  keywords: ['And', '&'],
  path: ['Boolean', 'Operators']
};

export const OrNodeDef: NodeDef<
  BooleanOperatorInputs,
  BooleanOperatorOutputs
> = {
  name: 'Or',
  type: 'Or',
  inputs: {
    valueA: BooleanSocket('Value A'),
    valueB: BooleanSocket('Value B')
  },
  outputs: {
    value: BooleanSocket('Result')
  },
  keywords: ['Or', '|'],
  path: ['Boolean', 'Operators']
};

export const XorNodeDef: NodeDef<
  BooleanOperatorInputs,
  BooleanOperatorOutputs
> = {
  name: 'Xor',
  type: 'Xor',
  inputs: {
    valueA: BooleanSocket('Value A'),
    valueB: BooleanSocket('Value B')
  },
  outputs: {
    value: BooleanSocket('Result')
  },
  keywords: ['exclusive', 'or'],
  path: ['Boolean', 'Operators']
};
