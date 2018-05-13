import { ServerNodeDef } from '../AllNodes';
import { NumberSocket, NUMBER_TYPE, StringSocket } from '../Sockets';

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
  onServerExecution: async (form, values) => {
    const val = Number.parseFloat(values.get('Number'));
    // TODO add formatting lib and notes
    return {
      outputs: new Map([['Formatted', val.toString()]])
    };
  }
};
