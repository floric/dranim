import {
  SumNodeDef,
  ServerNodeDef,
  SumNodeNodeInputs,
  SumNodeNodeOutputs
} from '@masterthesis/shared';

export const SumNode: ServerNodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  name: SumNodeDef.name,
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
      outputs: { sum: (a + b).toString() }
    };
  }
};
