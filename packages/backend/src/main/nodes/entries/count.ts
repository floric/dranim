import {
  allAreDefinedAndPresent,
  CountEntriesNodeDef,
  CountEntriesNodeInputs,
  CountEntriesNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const CountEntriesNode: ServerNodeDef<
  CountEntriesNodeInputs,
  CountEntriesNodeOutputs
> = {
  type: CountEntriesNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { count: { content: {}, isPresent: false } };
    }

    return { count: { content: {}, isPresent: true } };
  },
  onNodeExecution: async (form, inputs) => {
    return {
      outputs: {
        count: inputs.dataset.entries.length
      }
    };
  }
};
