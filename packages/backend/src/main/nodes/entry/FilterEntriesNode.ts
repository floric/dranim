import {
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const FilterEntriesNode: ServerNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: FilterEntriesNodeDef.name,
  onServerExecution: async (form, inputs, db) => {
    return {
      outputs: {
        dataset: {
          id: ''
        }
      }
    };
  }
};
