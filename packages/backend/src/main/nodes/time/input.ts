import {
  ServerNodeDef,
  TimeInputNodeDef,
  TimeInputNodeForm,
  TimeInputNodeOutputs
} from '@masterthesis/shared';

export const TimeInputNode: ServerNodeDef<
  {},
  TimeInputNodeOutputs,
  TimeInputNodeForm
> = {
  type: TimeInputNodeDef.type,
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
    if (form.value == null) {
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
