import {
  allAreDefinedAndPresent,
  ServerNodeDef,
  SumNodeDef,
  SumNodeInputs,
  SumNodeOutputs
} from '@masterthesis/shared';

export const SumNode: ServerNodeDef<SumNodeInputs, SumNodeOutputs> = {
  type: SumNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
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
