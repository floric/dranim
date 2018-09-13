import {
  AggregateEntriesNodeDef,
  AggregateEntriesNodeForm,
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs,
  allAreDefinedAndPresent,
  ServerNodeDef
} from '@masterthesis/shared';

export const AggregateEntriesNode: ServerNodeDef<
  AggregateEntriesNodeInputs,
  AggregateEntriesNodeOutputs,
  AggregateEntriesNodeForm
> = {
  type: AggregateEntriesNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { value: { content: {}, isPresent: false } };
    }

    return { value: { content: {}, isPresent: true } };
  },
  onNodeExecution: async (form, inputs) => {
    return {
      outputs: {
        value: 0
      }
    };
  }
};
