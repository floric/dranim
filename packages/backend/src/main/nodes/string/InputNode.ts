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
    if (form.value === undefined || form.value === null) {
      return {
        string: { content: {}, isPresent: false }
      };
    }

    return {
      string: { content: {}, isPresent: true }
    };
  },
  onServerExecution: form =>
    Promise.resolve({
      outputs: {
        string: form.value || ''
      }
    })
};
