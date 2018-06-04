import {
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

export const EditEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: EditEntriesNodeDef.name,
  transformContextInputDefsToContextOutputDefs: async (inputDefs, inputs) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return {};
    }

    return {};
  },
  transformInputDefsToContextInputDefs: async () => ({}),
  onMetaExecution: async () => ({
    dataset: {
      content: { schema: [] },
      isPresent: false
    }
  }),
  onServerExecution: async (form, inputs, db) => {
    return {
      outputs: {
        dataset: {
          datasetId: ''
        }
      }
    };
  }
};
