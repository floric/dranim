import {
  StringOutputNodeDef,
  ServerNodeDef,
  StringOutputNodeInputs
} from '@masterthesis/shared';

export const StringOutputNode: ServerNodeDef<StringOutputNodeInputs, {}> = {
  name: StringOutputNodeDef.name,
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        Result: ''
      }
    })
};
