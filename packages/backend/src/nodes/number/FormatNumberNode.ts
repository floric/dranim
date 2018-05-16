import numbro from 'numbro';
import { ServerNodeDef } from '../AllNodes';
import { NumberSocket, NUMBER_TYPE, StringSocket } from '../Sockets';
import { getOrDefault } from '../../../../frontend/src/utils/shared';

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
  isFormValid: () => {
    return true;
  },
  onServerExecution: async (form, values) => {
    const val = Number.parseFloat(values.get('Number'));
    const mantissa = getOrDefault<number>(form, 'mantissa', 0);
    const optMantissa = getOrDefault<boolean>(form, 'opt-mantissa', true);
    const thousandSeparated = getOrDefault<boolean>(
      form,
      'thousands-separated',
      true
    );
    const average = getOrDefault<boolean>(form, 'average', true);
    const spaceSeparated = getOrDefault<boolean>(form, 'space-separated', true);
    const output = getOrDefault<string>(form, 'output', 'percent');
    const totalLength = getOrDefault<number>(form, 'average-total', 3);

    const formatted = numbro(val).format({
      thousandSeparated,
      spaceSeparated,
      mantissa,
      output,
      average,
      totalLength
    });
    return {
      outputs: new Map([['Formatted', formatted]])
    };
  }
};
