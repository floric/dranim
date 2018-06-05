import {
  NumberInputNodeDef,
  NumberInputNodeForm,
  NumberInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { validateNumber } from './utils';

export const NumberInputNode: ServerNodeDef<
  {},
  NumberInputNodeOutputs,
  NumberInputNodeForm
> = {
  name: NumberInputNodeDef.name,
  isFormValid: form => Promise.resolve(validateNumber(form.value)),
  onMetaExecution: async form => {
    if (form.value == null) {
      return {
        value: { content: {}, isPresent: false }
      };
    }

    return {
      value: { content: {}, isPresent: true }
    };
  },
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        value: form.value!
      }
    })
};
