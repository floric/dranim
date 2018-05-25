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
  name: NumberOutputNodeDef.name,
  isInputValid: async input => {
    if (Number.isNaN(input.val)) {
      return false;
    }

    return true;
  },
  onServerExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: inputs.val
      }
    })
};
