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

export interface BooleanOutputNodeInputs {
  value: boolean;
}

export interface BooleanOutputNodeResults {
  value: boolean;
}

export const BooleanOutputNodeDef: NodeDef<BooleanOutputNodeInputs, {}> = {
  name: 'Boolean Output',
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
