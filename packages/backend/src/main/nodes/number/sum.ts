import {
  ServerNodeDef,
  SumNodeDef,
  SumNodeNodeInputs,
  SumNodeNodeOutputs
} from '@masterthesis/shared';

export const SumNode: ServerNodeDef<SumNodeNodeInputs, SumNodeNodeOutputs> = {
  type: SumNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (
      inputs.a == null ||
      inputs.b == null ||
      !inputs.a.isPresent ||
      !inputs.b.isPresent
    ) {
      return {
        sum: { content: {}, isPresent: false }
      };
    }

    return {
      sum: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: (form, values) =>
    Promise.resolve({
      outputs: { sum: values.a + values.b }
    })
};
