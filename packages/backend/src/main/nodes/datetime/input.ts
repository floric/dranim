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
  isFormValid: async form => {
    const { value } = form;
    if (!value) {
      return false;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return false;
    }

    return true;
  },
  onMetaExecution: async form => {
    const { value } = form;
    if (value == null) {
      return {
        value: { content: {}, isPresent: false }
      };
    }

    return {
      value: { content: {}, isPresent: true }
    };
  },
  onNodeExecution: form =>
    Promise.resolve({
      outputs: {
        value: new Date(form.value!)
      }
    })
};
