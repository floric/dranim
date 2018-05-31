import {
  ForEachEntryNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const ForEachEntryNode: ServerNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: ForEachEntryNodeDef.name,
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
