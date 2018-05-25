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
  isFormValid: async form => validateNumber(form.value),
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        val: form.value!
      }
    })
};
