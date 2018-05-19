import { NodeDef } from '../interfaces';
import { NumberSocket, StringSocket } from '../sockets';

export const FormatNumberNodeDef: NodeDef = {
  name: 'Format Number',
  inputs: [NumberSocket('Number')],
  outputs: [StringSocket('Formatted')],
  path: ['Numbers', 'Converters'],
  keywords: []
};

export const NumberInputNodeDef: NodeDef = {
  name: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number')],
  path: ['Numbers'],
  keywords: []
};

export const MultiplicationNodeDef: NodeDef = {
  name: 'Multiplication',
  inputs: [NumberSocket('A'), NumberSocket('B')],
  outputs: [NumberSocket('Product')],
  path: ['Numbers', 'Operators'],
  keywords: ['times', 'multiplication']
};

export const NumberOutputNodeDef: NodeDef = {
  name: 'Number Output',
  inputs: [NumberSocket('Number')],
  outputs: [],
  keywords: [],
  path: ['Numbers']
};

export const SumNodeDef: NodeDef = {
  name: 'Sum',
  inputs: [NumberSocket('A'), NumberSocket('B')],
  outputs: [NumberSocket('Sum')],
  path: ['Numbers', 'Operators'],
  keywords: ['sum', 'add']
};
