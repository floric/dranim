import { NodeDef } from '../nodes';
import { NumberSocket, StringSocket } from '../sockets';

export interface FormatNumberNodeInputs {
  number: string;
}
export interface FormatNumberNodeOutputs {
  formatted: string;
}
export interface FormatNumberNodeForm {
  mantissa: number;
  optMantissa: boolean;
  thousandsSeparated: boolean;
  average: boolean;
  spaceSeparated: boolean;
  output: 'number' | 'ordinal' | 'byte' | 'percent' | 'time';
  averageTotal: number;
}

export const FormatNumberNodeDef: NodeDef<
  FormatNumberNodeInputs,
  FormatNumberNodeOutputs
> = {
  name: 'Format',
  type: 'FormatNumber',
  inputs: {
    number: NumberSocket('Number')
  },
  outputs: {
    formatted: StringSocket('Formatted')
  },
  path: ['Numbers', 'Converters'],
  keywords: ['to string']
};

export interface NumberInputNodeOutputs {
  value: number;
}

export interface NumberInputNodeForm {
  value: number;
}

export const NumberInputNodeDef: NodeDef<{}, NumberInputNodeOutputs> = {
  name: 'Input',
  type: 'NumberInput',
  inputs: {},
  outputs: {
    value: NumberSocket('Number')
  },
  path: ['Numbers'],
  keywords: []
};

export interface MultiplicationNodeInputs {
  a: number;
  b: number;
}

export interface MultiplicationNodeOutputs {
  product: number;
}

export const MultiplicationNodeDef: NodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: 'Multiplication',
  type: 'Multiplication',
  inputs: {
    a: NumberSocket('A'),
    b: NumberSocket('B')
  },
  outputs: {
    product: NumberSocket('Product')
  },
  path: ['Numbers', 'Operators'],
  keywords: ['times', 'multiplication']
};

export interface NumberOutputNodeInputs {
  value: number;
}

export interface SumNodeNodeInputs {
  a: number;
  b: number;
}

export interface SumNodeNodeOutputs {
  sum: number;
}

export const NumberOutputNodeDef: NodeDef<NumberOutputNodeInputs, {}> = {
  name: 'Output',
  type: 'NumberOutput',
  inputs: {
    value: NumberSocket('Number')
  },
  isOutputNode: true,
  outputs: {},
  keywords: [],
  path: ['Numbers']
};

export const SumNodeDef: NodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  name: 'Sum',
  type: 'Sum',
  inputs: {
    a: NumberSocket('A'),
    b: NumberSocket('B')
  },
  outputs: {
    sum: NumberSocket('Sum')
  },
  path: ['Numbers', 'Operators'],
  keywords: ['sum', 'add']
};
