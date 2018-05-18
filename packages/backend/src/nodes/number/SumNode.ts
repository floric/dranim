import { ServerNodeDef } from '../AllNodes';
import { NumberSocket } from '../Sockets';

export const SumNode: ServerNodeDef = {
  title: 'Sum',
  inputs: [NumberSocket('A'), NumberSocket('B')],
  outputs: [NumberSocket('Sum')],
  path: ['Numbers', 'Operators'],
  keywords: ['sum', 'add'],
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
      outputs: new Map([['Sum', (a + b).toString()]])
    };
  }
};
