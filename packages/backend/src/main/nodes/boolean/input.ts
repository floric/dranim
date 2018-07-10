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
  onMetaExecution: () =>
    Promise.resolve({
      value: { content: {}, isPresent: true }
    }),
  onNodeExecution: form =>
    Promise.resolve({
      outputs: {
        value: form.value || false
      }
    })
};
