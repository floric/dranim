import {
  MultiplicationNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { absentMeta, presentMeta } from '../all-nodes';
import { validateNumber } from './utils';

export const MultiplicationNode: ServerNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: MultiplicationNodeDef.name,
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
        product: absentMeta
      };
    }

    return {
      product: presentMeta
    };
  },
  onServerExecution: async (form, values) => {
    return {
      outputs: {
        product: values.a * values.b
      }
    };
  }
};
