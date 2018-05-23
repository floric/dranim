const numbro = require('numbro');
import { FormatNumberNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const FormatNumberNode: ServerNodeDef<
  { number: string },
  { formatted: string },
  {
    mantissa?: number;
    'opt-mantissa'?: boolean;
    'thousands-separated'?: boolean;
    average?: boolean;
    'space-separated'?: boolean;
    output?: string;
    'average-total'?: number;
  }
> = {
  name: FormatNumberNodeDef.name,
  isInputValid: async input => {
    const val = input.number;

    if (!val || Number.isNaN(Number.parseFloat(val))) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, inputs) => {
    const val = Number.parseFloat(inputs.number);
    const mantissa = form.mantissa || 0;
    const optionalMantissa = form['opt-mantissa'] || true;
    const thousandSeparated = form['thousands-separated'] || true;
    const average = form.average || false;
    const spaceSeparated = form['space-separated'] || true;
    const output = form.output || 'number';
    const totalLength = form['average-total'] || 1;

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
      outputs: {
        formatted
      }
    };
  }
};
