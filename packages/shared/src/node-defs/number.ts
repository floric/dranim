import { NodeDef } from '../nodes';
import { BooleanSocket, NumberSocket, StringSocket } from '../sockets';

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
  name: 'Format Number',
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
  name: 'Input Number',
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
    a: NumberSocket('Number A'),
    b: NumberSocket('Number B')
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

export interface SumNodeInputs {
  a: number;
  b: number;
}

export interface SumNodeOutputs {
  sum: number;
}

export const NumberOutputNodeDef: NodeDef<NumberOutputNodeInputs, {}> = {
  name: 'Output Number',
  type: 'NumberOutput',
  inputs: {
    value: NumberSocket('Number')
  },
  isOutputNode: true,
  outputs: {},
  keywords: [],
  path: ['Numbers']
};

export const SumNodeDef: NodeDef<SumNodeInputs, SumNodeOutputs> = {
  name: 'Sum',
  type: 'Sum',
  inputs: {
    a: NumberSocket('Number A'),
    b: NumberSocket('Number B')
  },
  outputs: {
    sum: NumberSocket('Sum')
  },
  path: ['Numbers', 'Operators'],
  keywords: ['sum', 'add']
};

export interface ComparisonNodeInputs {
  a: number;
  b: number;
}

export interface ComparisonNodeOutputs {
  value: boolean;
}

export enum ComparisonType {
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  EQUALS = 'EQUALS'
}

export interface ComparisonNodeForm {
  type: ComparisonType;
}

export const ComparisonNodeDef: NodeDef<
  ComparisonNodeInputs,
  ComparisonNodeOutputs
> = {
  name: 'Compare Numbers',
  type: 'CompareNumbers',
  inputs: {
    a: NumberSocket('Number A'),
    b: NumberSocket('Number B')
  },
  outputs: {
    value: BooleanSocket('A compared to B')
  },
  path: ['Numbers', 'Operators'],
  keywords: ['less than', 'greater than', 'equals', 'compare']
};
