import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';
import { validateDataset } from './utils';

export const DatasetInputNode: ServerNodeDef<
  {},
  DatasetInputNodeOutputs,
  DatasetInputNodeForm
> = {
  name: DatasetInputNodeDef.name,
  isFormValid: form => Promise.resolve(form.dataset !== null),
  onServerExecution: async (form, inputs, db) => {
    await validateDataset(form.dataset!, db);

    return {
      outputs: {
        dataset: {
          id: form.dataset!
        }
      }
    };
  }
};
