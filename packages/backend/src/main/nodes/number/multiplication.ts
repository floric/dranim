import {
  allAreDefinedAndPresent,
  MultiplicationNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const MultiplicationNode: ServerNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  type: MultiplicationNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
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
