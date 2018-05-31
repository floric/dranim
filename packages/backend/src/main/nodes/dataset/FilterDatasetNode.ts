import {
  FilterDatasetNodeDef,
  FilterDatasetNodeForm,
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { getCreatedDatasetName } from '../../calculation/utils';
import { createDataset, getDataset } from '../../workspace/dataset';
import { validateDatasetInput } from './utils';

export const FilterDatasetNode: ServerNodeDef<
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs,
  FilterDatasetNodeForm
> = {
  name: FilterDatasetNodeDef.name,
  isInputValid: inputs => validateDatasetInput(inputs),
  isFormValid: form => {
    const rulesCount = Object.keys(form)
      .map(type =>
        Object.keys(form[type]).map(method => form[type][method].length)
      )
      .reduce((a, b) => a.concat(b), [])
      .reduce((a, b) => a + b, 0);

    if (rulesCount === 0) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  },
  onServerExecution: async (form, inputs, db) => {
    const oldDs = await getDataset(db, inputs.dataset.id);
    if (!oldDs) {
      throw new Error('Invalid dataset');
    }

    const newDs = await createDataset(
      db,
      getCreatedDatasetName(FilterDatasetNode.name)
    );

    return {
      outputs: {
        dataset: { id: newDs.id }
      }
    };
  }
};
