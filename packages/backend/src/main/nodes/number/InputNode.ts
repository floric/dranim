import {
  NumberInputNodeDef,
  NumberInputNodeForm,
  NumberInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const NumberInputNode: ServerNodeDef<
  {},
  NumberInputNodeOutputs,
  NumberInputNodeForm
> = {
  name: NumberInputNodeDef.name,
  isFormValid: async form => {
    const input = form.value;
    if (!input || Number.isNaN(input)) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) =>
    Promise.resolve({
      outputs: {
        val: form.value ? form.value : 0
      }
    })
};
