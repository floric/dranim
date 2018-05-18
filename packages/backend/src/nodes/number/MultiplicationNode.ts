import { ServerNodeDef } from '../AllNodes';
import { NumberSocket } from '../Sockets';

export const MultiplicationNode: ServerNodeDef = {
  title: 'Multiplication',
  inputs: [NumberSocket('A'), NumberSocket('B')],
  outputs: [NumberSocket('Product')],
  path: ['Numbers', 'Operators'],
  keywords: ['times', 'multiplication'],
  isInputValid: async values => {
    const aVal = values.get('A');
    const bVal = values.get('B');

    if (
      !aVal ||
      !bVal ||
      Number.isNaN(Number.parseFloat(aVal)) ||
      Number.isNaN(Number.parseFloat(bVal))
    ) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) => {
    const a = Number.parseFloat(values.get('A')!);
    const b = Number.parseFloat(values.get('B')!);
    return {
      outputs: new Map([['Product', (a * b).toString()]])
    };
  }
};
