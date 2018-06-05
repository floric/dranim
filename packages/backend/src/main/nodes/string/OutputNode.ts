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
  onNodeExecution: (form, values) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: values.string
      }
    })
};
