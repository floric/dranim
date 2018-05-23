import {
  MultiplicationNodeDef,
  ServerNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
} from '@masterthesis/shared';

export const MultiplicationNode: ServerNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: MultiplicationNodeDef.name,
  isInputValid: async values => {
    const aVal = values.a;
    const bVal = values.b;

    if (
      !aVal ||
      !bVal ||
      Number.isNaN(Number.parseFloat(aVal)) ||
      Number.isNaN(Number.parseFloat(bVal))
    ) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) => {
    const a = Number.parseFloat(values.a);
    const b = Number.parseFloat(values.b);
    return {
      outputs: {
        product: (a * b).toString()
      }
    };
  }
};
