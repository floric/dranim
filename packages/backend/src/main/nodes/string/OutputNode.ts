import {
  ServerNodeDef,
  StringOutputNodeDef,
  StringOutputNodeInputs,
  StringOutputNodeResults
} from '@masterthesis/shared';

export const StringOutputNode: ServerNodeDef<
  StringOutputNodeInputs,
  {},
  {},
  StringOutputNodeResults
> = {
  name: StringOutputNodeDef.name,
  onServerExecution: async (form, values) => {
    return {
      outputs: {},
      results: {
        value: values.string
      }
    };
  }
};
