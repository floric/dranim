import {
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const EditEntriesNode: ServerNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: EditEntriesNodeDef.name,
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
