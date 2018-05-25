import {
  SelectValuesNodeDef,
  SelectValuesNodeForm,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const SelectValuesNode: ServerNodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeForm
> = {
  name: SelectValuesNodeDef.name,
  isInputValid: async inputs => {
    const val = inputs.dataset;
    if (!val) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, inputs) => {
    return { outputs: { dataset: '{}' } };
  }
};
