import { ServerNodeDef } from '../AllNodes';
import { NumberSocket } from '../Sockets';

export const NumberInputNode: ServerNodeDef = {
  title: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number')],
  path: ['Numbers'],
  keywords: [],
  isInputValid: inputs => Promise.resolve(true),
  isFormValid: form => {
    const input = form.find(n => n.name === 'value');
    if (!input || Number.isNaN(Number.parseFloat(input.value))) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) =>
    Promise.resolve({
      outputs: new Map([
        [
          'Number',
          form.find(n => n.name === 'value')
            ? form.find(n => n.name === 'value')!.value
            : ''
        ]
      ])
    })
};
