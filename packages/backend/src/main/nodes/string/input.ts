import {
  ServerNodeDef,
  StringInputNodeDef,
  StringInputNodeForm,
  StringInputNodeOutputs
} from '@masterthesis/shared';

export const StringInputNode: ServerNodeDef<
  {},
  StringInputNodeOutputs,
  StringInputNodeForm
> = {
  name: StringInputNodeDef.name,
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
        value: form.value || ''
      }
    })
};
