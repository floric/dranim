import {
  GetStringNodeDef,
  GetStringNodeOutputs,
  GetterNodeInputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const GetStringNode: ServerNodeDef<
  GetterNodeInputs,
  GetStringNodeOutputs
> = {
  name: GetStringNodeDef.name,
  onServerExecution: async (form, inputs, db) => {
    return {
      outputs: {
        value: ''
      }
    };
  }
};
