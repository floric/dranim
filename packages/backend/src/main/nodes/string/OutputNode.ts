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
  onMetaExecution: () => Promise.resolve({}),
  onServerExecution: async (form, values) => {
    return {
      outputs: {},
      results: {
        value: values.string
      }
    };
  }
};
