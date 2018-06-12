import {
  ServerNodeDef,
  SumNodeDef,
  SumNodeNodeInputs,
  SumNodeNodeOutputs
} from '@masterthesis/shared';

import { validateNumber } from './utils';

export const SumNode: ServerNodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  type: SumNodeDef.type,
  isInputValid: values =>
    Promise.resolve(validateNumber(values.a) && validateNumber(values.b)),
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.a == null ||
      inputs.b == null ||
      !inputs.a.isPresent ||
      !inputs.b.isPresent
    ) {
      return {
        sum: { content: {}, isPresent: false }
      };
    }

    return {
      sum: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: (form, values) =>
    Promise.resolve({
      outputs: { sum: values.a + values.b }
    })
};
