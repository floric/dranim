import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { getDataset } from '../../workspace/dataset';
import { validateDataset } from './utils';

export const DatasetInputNode: ServerNodeDef<
  {},
  DatasetInputNodeOutputs,
  DatasetInputNodeForm
> = {
  name: DatasetInputNodeDef.name,
  isFormValid: form => Promise.resolve(!!form.dataset),
  onMetaExecution: async (form, inputs, db) => {
    if (!form.dataset) {
      return {
        dataset: { isPresent: false, content: { schema: [] } }
      };
    }

    const ds = await getDataset(db, form.dataset);
    if (!ds) {
      return {
        dataset: { isPresent: false, content: { schema: [] } }
      };
    }

    return {
      dataset: {
        content: {
          schema: ds.valueschemas
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (form, inputs, db) => {
    await validateDataset(form.dataset!, db);

    return {
      outputs: {
        dataset: {
          datasetId: form.dataset!
        }
      }
    };
  }
};
