import {
  TimeInputNodeDef,
  TimeInputNodeForm,
  TimeInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { validateNumber } from '../number/utils';

export const TimeInputNode: ServerNodeDef<
  {},
  TimeInputNodeOutputs,
  TimeInputNodeForm
> = {
  type: TimeInputNodeDef.type,
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
  onNodeExecution: (form, values) =>
    Promise.resolve({
      outputs: {
        value: form.value!
      }
    })
};
