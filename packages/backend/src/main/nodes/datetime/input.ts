import {
  DatetimeInputNodeDef,
  DatetimeInputNodeForm,
  DatetimeInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const DatetimeInputNode: ServerNodeDef<
  {},
  DatetimeInputNodeOutputs,
  DatetimeInputNodeForm
> = {
  type: DatetimeInputNodeDef.type,
  isFormValid: form => Promise.resolve(form.value != null),
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
