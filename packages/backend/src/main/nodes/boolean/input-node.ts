import {
  BooleanInputNodeDef,
  BooleanInputNodeForm,
  BooleanInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const BooleanInputNode: ServerNodeDef<
  {},
  BooleanInputNodeOutputs,
  BooleanInputNodeForm
> = {
  name: BooleanInputNodeDef.name,
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
  onServerExecution: form =>
    Promise.resolve({
      outputs: {
        value: form.value || false
      }
    })
};
