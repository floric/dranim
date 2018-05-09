import { NodeDef } from '../AllNodes';
import { NumberSocket, NUMBER_TYPE } from '../Sockets';

export const NumberInputNode: NodeDef = {
  title: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number')],
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
      outputs: new Map([['Number', form.find(n => n.name === 'value').value]])
    })
};
