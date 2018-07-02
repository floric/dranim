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
  isFormValid: form => Promise.resolve(form.dataset != null),
  onMetaExecution: async (form, inputs, reqContext) => {
    if (form.dataset == null) {
      return {
        dataset: { isPresent: false, content: { schema: [] } }
      };
    }

    const ds = await getDataset(form.dataset, reqContext);
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
  onNodeExecution: async form => {
    return {
      outputs: {
        dataset: {
          datasetId: form.dataset!
        }
      }
    };
  }
};
