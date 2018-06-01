import {
  GetDateNodeDef,
  GetDateNodeOutputs,
  GetterNodeInputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const GetDateNode: ServerNodeDef<
  GetterNodeInputs,
  GetDateNodeOutputs
> = {
  name: GetDateNodeDef.name,
  onServerExecution: async (form, inputs, db) => {
    return {
      outputs: {
        value: new Date()
      }
    };
  }
};
