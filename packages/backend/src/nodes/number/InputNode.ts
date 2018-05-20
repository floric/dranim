import {
  NumberInputNodeDef,
  ServerNodeDef,
  NumberInputNodeOutputs,
  NumberInputNodeForm
} from '@masterthesis/shared';

export const NumberInputNode: ServerNodeDef<
  {},
  NumberInputNodeOutputs,
  NumberInputNodeForm
> = {
  name: NumberInputNodeDef.name,
  isFormValid: async form => {
    const input = form.value;
    if (!input || Number.isNaN(Number.parseFloat(input))) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) =>
    Promise.resolve({
      outputs: {
        val: form.value.toString() || '0'
      }
    })
};
