const numbro = require('numbro');
import { FormatNumberNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const FormatNumberNode: ServerNodeDef<
  { Number: string },
  { Formatted: string },
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
    const val = input.Number;

    if (!val || Number.isNaN(Number.parseFloat(val))) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, inputs) => {
    const val = Number.parseFloat(inputs.Number);
    const mantissa = form.mantissa || 0;
    const optionalMantissa = form['opt-mantissa'] || true;
    const thousandSeparated = form['thousands-separated'] || true;
    const average = form.average || true;
    const spaceSeparated = form['space-separated'] || true;
    const output = form.output || 'number';
    const totalLength = form['average-total'] || 3;

    const Formatted = numbro(val).format({
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
        Formatted
      }
    };
  }
};
