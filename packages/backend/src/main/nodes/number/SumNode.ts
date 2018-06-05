import {
  ServerNodeDef,
  SumNodeDef,
  SumNodeNodeInputs,
  SumNodeNodeOutputs
} from '@masterthesis/shared';

import { validateNumber } from './utils';

export const SumNode: ServerNodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  name: SumNodeDef.name,
  isInputValid: values =>
    Promise.resolve(validateNumber(values.a) && validateNumber(values.b)),
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.a === null ||
      inputs.a === undefined ||
      inputs.b === null ||
      inputs.b === undefined
    ) {
      return {
        sum: { content: {}, isPresent: false }
      };
    }

    return {
      sum: { content: {}, isPresent: true }
    };
  },
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: { sum: values.a + values.b }
    })
};
