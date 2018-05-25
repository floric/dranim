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
    const val = input.val;

    if (!val || Number.isNaN(Number.parseFloat(val))) {
      return false;
    }

    return true;
  },
  onServerExecution: (form, inputs) =>
    Promise.resolve({
      outputs: {},
      results: {
        value: Number.parseFloat(inputs.val)
      }
    })
};
