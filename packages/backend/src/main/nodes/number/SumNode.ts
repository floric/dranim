import {
  ServerNodeDef,
  SumNodeDef,
  SumNodeNodeInputs,
  SumNodeNodeOutputs
} from '@masterthesis/shared';

import { validateNumber } from './utils';

export const SumNode: ServerNodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  name: SumNodeDef.name,
  isInputValid: async values =>
    validateNumber(values.a) && validateNumber(values.b),
  onServerExecution: async (form, values) => {
    return {
      outputs: { sum: values.a + values.b }
    };
  }
};
