import {
  MultiplicationNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const MultiplicationNode: ServerNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: MultiplicationNodeDef.name,
  isInputValid: async values => {
    if (Number.isNaN(values.a) || Number.isNaN(values.b)) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) => {
    return {
      outputs: {
        product: values.a * values.b
      }
    };
  }
};
