import {
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

export const FilterEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: FilterEntriesNodeDef.name,
  transformInputDefsToContextInputDefs: () => Promise.resolve({}),
  transformContextInputDefsToContextOutputDefs: () => Promise.resolve({}),
  onMetaExecution: async () => ({
    dataset: {
      content: { schema: [] },
      isPresent: true
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
