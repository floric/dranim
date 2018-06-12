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
  type: MultiplicationNodeDef.type,
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
        product: { content: {}, isPresent: false }
      };
    }

    return {
      product: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        product: values.a * values.b
      }
    })
};
