const numbro = require('numbro');
import { FormatNumberNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const FormatNumberNode: ServerNodeDef<
  { number: number },
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
    if (input.number == null || Number.isNaN(input.number)) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs) => {
    if (inputs.number == null || !inputs.number.isPresent) {
      return {
        formatted: { content: {}, isPresent: false }
      };
    }

    return {
      formatted: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: async (form, inputs) => {
    const mantissa = form.mantissa || 0;
    const optionalMantissa = form['opt-mantissa'] || true;
    const thousandSeparated = form['thousands-separated'] || true;
    const average = form.average || false;
    const spaceSeparated = form['space-separated'] || true;
    const output = form.output || 'number';
    const totalLength = form['average-total'] || 1;

    const formatted = numbro(inputs.number).format({
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
