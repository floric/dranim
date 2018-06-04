import {
  NumberInputNodeDef,
  NumberInputNodeForm,
  NumberInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { absentMeta, presentMeta } from '../all-nodes';
import { validateNumber } from './utils';

export const NumberInputNode: ServerNodeDef<
  {},
  NumberInputNodeOutputs,
  NumberInputNodeForm
> = {
  name: NumberInputNodeDef.name,
  isFormValid: form => Promise.resolve(validateNumber(form.value)),
  onMetaExecution: async form => {
    if (form.value === null || form.value === undefined) {
      return {
        value: absentMeta
      };
    }

    return {
      value: presentMeta
    };
  },
  onServerExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        value: form.value!
      }
    })
};
