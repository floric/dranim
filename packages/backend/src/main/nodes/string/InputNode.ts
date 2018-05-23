import {
  StringInputNodeDef,
  ServerNodeDef,
  StringInputNodeOutputs,
  StringInputNodeForm
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
