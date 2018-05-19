const numbro = require('numbro');
import {
  getOrDefault,
  FormatNumberNodeDef,
  ServerNodeDef
} from '@masterthesis/shared';

export const FormatNumberNode: ServerNodeDef = {
  name: FormatNumberNodeDef.name,
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
    const val = Number.parseFloat(values.get('Number')!);
    const mantissa = getOrDefault<number>(form, 'mantissa', 0);
    const optionalMantissa = getOrDefault<boolean>(form, 'opt-mantissa', true);
    const thousandSeparated = getOrDefault<boolean>(
      form,
      'thousands-separated',
      true
    );
    const average = getOrDefault<boolean>(form, 'average', true);
    const spaceSeparated = getOrDefault<boolean>(form, 'space-separated', true);
    const output = getOrDefault<string>(form, 'output', 'number');
    const totalLength = getOrDefault<number>(form, 'average-total', 3);

    const formatted = numbro(val).format({
      thousandSeparated,
      spaceSeparated,
      mantissa,
      optionalMantissa,
      output,
      average,
      totalLength
    });

    return {
      outputs: new Map([['Formatted', formatted]])
    };
  }
};
