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
  type: BooleanInputNodeDef.type,
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
        value: form.value || false
      }
    })
};
