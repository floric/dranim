import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { getDataset } from '../../workspace/dataset';
import { absentDataset, validateDataset } from './utils';

export const DatasetInputNode: ServerNodeDef<
  {},
  DatasetInputNodeOutputs,
  DatasetInputNodeForm
> = {
  name: DatasetInputNodeDef.name,
  isFormValid: form => Promise.resolve(!!form.dataset),
  onMetaExecution: async (form, inputs, db) => {
    const dsId = form.dataset;
    if (!dsId) {
      return {
        dataset: absentDataset
      };
    }

    const ds = await getDataset(db, dsId);
    if (!ds) {
      return {
        dataset: absentDataset
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
  onServerExecution: async (form, inputs, db) => {
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
