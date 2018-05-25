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
  onServerExecution: async form => {
    return {
      outputs: {
        string: form.value || ''
      }
    };
  }
};
