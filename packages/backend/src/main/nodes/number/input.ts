import {
  NumberInputNodeDef,
  NumberInputNodeForm,
  NumberInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const NumberInputNode: ServerNodeDef<
  {},
  NumberInputNodeOutputs,
  NumberInputNodeForm
> = {
  type: NumberInputNodeDef.type,
  onMetaExecution: () =>
    Promise.resolve({ value: { content: {}, isPresent: true } }),
  onNodeExecution: form =>
    Promise.resolve({
      outputs: {
        value: form.value || 0
      }
    })
};
