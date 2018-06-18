import {
  NumberOutputNodeDef,
  NumberOutputNodeInputs,
  NumberOutputNodeResults,
  ServerNodeDef
} from '@masterthesis/shared';

export const NumberOutputNode: ServerNodeDef<
  NumberOutputNodeInputs,
  {},
  {},
  NumberOutputNodeResults
> = {
  type: NumberOutputNodeDef.type,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.value
      }
    })
};
