import {
  GetNumberNodeDef,
  GetNumberNodeOutputs,
  GetterNodeInputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const GetNumberNode: ServerNodeDef<
  GetterNodeInputs,
  GetNumberNodeOutputs
> = {
  name: GetNumberNodeDef.name,
  onServerExecution: async (form, inputs, db) => {
    return {
      outputs: {
        value: 0
      }
    };
  }
};
