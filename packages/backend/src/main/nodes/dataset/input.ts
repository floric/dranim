import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { getDataset } from '../../workspace/dataset';

export const DatasetInputNode: ServerNodeDef<
  {},
  DatasetInputNodeOutputs,
  DatasetInputNodeForm
> = {
  type: DatasetInputNodeDef.type,
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
  onNodeExecution: async (form, inputs, { db }) => {
    return {
      outputs: {
        dataset: {
          datasetId: form.dataset!
        }
      }
    };
  }
};
