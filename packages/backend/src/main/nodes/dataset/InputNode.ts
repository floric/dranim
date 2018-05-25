import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const DatasetInputNode: ServerNodeDef<
  {},
  DatasetInputNodeOutputs,
  DatasetInputNodeForm
> = {
  name: DatasetInputNodeDef.name,
  isFormValid: form => Promise.resolve(form.dataset !== null),
  onServerExecution: form =>
    Promise.resolve({
      outputs: {
        dataset: {
          id: form.dataset || 'new'
        }
      }
    })
};
