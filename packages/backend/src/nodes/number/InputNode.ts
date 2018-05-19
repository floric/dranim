import { NumberInputNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const NumberInputNode: ServerNodeDef = {
  name: NumberInputNodeDef.name,
  isFormValid: async form => {
    const input = form.get('value');
    if (!input || Number.isNaN(Number.parseFloat(input))) {
      return false;
    }

    return true;
  },
  onServerExecution: async (form, values) =>
    Promise.resolve({
      outputs: new Map([
        ['Number', form.has('value') ? form.get('value')! : '']
      ])
    })
};
