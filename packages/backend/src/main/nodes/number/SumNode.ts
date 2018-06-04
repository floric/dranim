import {
  ServerNodeDef,
  SumNodeDef,
  SumNodeNodeInputs,
  SumNodeNodeOutputs
} from '@masterthesis/shared';

import { absentMeta, presentMeta } from '../all-nodes';
import { validateNumber } from './utils';

export const SumNode: ServerNodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  name: SumNodeDef.name,
  isInputValid: async values =>
    validateNumber(values.a) && validateNumber(values.b),
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.a === null ||
      inputs.a === undefined ||
      inputs.b === null ||
      inputs.b === undefined
    ) {
      return {
        sum: absentMeta
      };
    }

    return {
      sum: presentMeta
    };
  },
  onServerExecution: async (form, values) => {
    return {
      outputs: { sum: values.a + values.b }
    };
  }
};
