import { ServerNodeDef } from '../AllNodes';
import { NumberSocket, NUMBER_TYPE, StringSocket } from '../Sockets';
import numbro from 'numbro';

export const FormatNumberNode: ServerNodeDef = {
  title: 'Format Number',
  inputs: [NumberSocket('Number')],
  outputs: [StringSocket('Formatted')],
  path: ['Numbers', 'Converters'],
  keywords: [],
  isInputValid: async values => {
    const val = values.get('Number');

    if (!val || Number.isNaN(Number.parseFloat(val))) {
      return false;
    }

    return true;
  },
  isFormValid: form => {
    const val = form.find(n => n.name === 'format');
    if (!val) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) => {
    const val = Number.parseFloat(values.get('Number'));
    const format = form.find(n => n.name === 'format');
    if (!format) {
      throw new Error('Invalid format');
    }
    const formatted = '0.0';

    return {
      outputs: new Map([['Formatted', formatted]])
    };
  }
};
