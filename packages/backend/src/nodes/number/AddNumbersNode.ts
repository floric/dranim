import { NodeDef } from '../AllNodes';
import { NumberSocket, NUMBER_TYPE } from '../Sockets';

export const AddNumbersNode: NodeDef = {
  title: 'Add Numbers',
  inputs: [NumberSocket('A'), NumberSocket('B')],
  outputs: [NumberSocket('Sum')],
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
    const a = Number.parseFloat(values.get('A'));
    const b = Number.parseFloat(values.get('B'));
    return {
      outputs: new Map([['Sum', (a + b).toString()]])
    };
  }
};
