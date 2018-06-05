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
        product: { content: {}, isPresent: false }
      };
    }

    return {
      product: { content: {}, isPresent: true }
    };
  },
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        product: values.a * values.b
      }
    })
};
