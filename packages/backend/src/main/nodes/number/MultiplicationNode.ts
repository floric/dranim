import {
  MultiplicationNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { validateNumber } from './utils';

export const MultiplicationNode: ServerNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: MultiplicationNodeDef.name,
  isInputValid: async values =>
    validateNumber(values.a) && validateNumber(values.b),
  onServerExecution: async (form, values) => {
    return {
      outputs: {
        product: values.a * values.b
      }
    };
  }
};
