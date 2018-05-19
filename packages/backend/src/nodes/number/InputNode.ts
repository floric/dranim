import { ServerNodeDef } from '../AllNodes';
import { NumberSocket } from '../Sockets';

export const NumberInputNode: ServerNodeDef = {
  title: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number')],
  path: ['Numbers'],
  keywords: [],
  isFormValid: form => {
    const input = form.get('value');
    if (!input || Number.isNaN(Number.parseFloat(input))) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) =>
    Promise.resolve({
      outputs: new Map([
        ['Number', form.has('value') ? form.get('value')! : '']
      ])
    })
};
