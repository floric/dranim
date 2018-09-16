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
  type: StringInputNodeDef.type,
  onMetaExecution: () =>
    Promise.resolve({ value: { content: {}, isPresent: true } }),
  onNodeExecution: form =>
    Promise.resolve({
      outputs: {
        value: form.value || ''
      }
    })
};
