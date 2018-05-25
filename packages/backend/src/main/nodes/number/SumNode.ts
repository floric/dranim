import {
  ServerNodeDef,
  SumNodeDef,
  SumNodeNodeInputs,
  SumNodeNodeOutputs
} from '@masterthesis/shared';

export const SumNode: ServerNodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  name: SumNodeDef.name,
  isInputValid: async values => {
    if (Number.isNaN(values.a) || Number.isNaN(values.b)) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) => {
    return {
      outputs: { sum: values.a + values.b }
    };
  }
};
