import {
  BooleanOutputNodeDef,
  BooleanOutputNodeInputs,
  BooleanOutputNodeResults,
  ServerNodeDef
} from '@masterthesis/shared';

export const BooleanOutputNode: ServerNodeDef<
  BooleanOutputNodeInputs,
  {},
  {},
  BooleanOutputNodeResults
> = {
  name: BooleanOutputNodeDef.name,
  isInputValid: async inputs => {
    if (inputs.value == null) {
      return false;
    }

    return true;
  },
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.value
      }
    })
};
