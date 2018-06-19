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
  type: StringOutputNodeDef.type,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.value
      }
    })
};
