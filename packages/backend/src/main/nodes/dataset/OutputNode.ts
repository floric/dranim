import {
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DatasetOutputNodeResults,
  ServerNodeDef
} from '@masterthesis/shared';

import { validateDataset, validateDatasetInput } from './utils';

export const DatasetOutputNode: ServerNodeDef<
  DatasetOutputNodeInputs,
  {},
  {},
  DatasetOutputNodeResults
> = {
  name: DatasetOutputNodeDef.name,
  isInputValid: inputs => validateDatasetInput(inputs),
  onMetaExecution: async (form, inputs) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return {
        dataset: { content: { schema: [] }, isPresent: false }
      };
    }

    return inputs;
  },
  onServerExecution: async (form, inputs, db) => {
    await validateDataset(inputs.dataset.datasetId, db);

    return {
      outputs: {},
      results: { dataset: inputs.dataset }
    };
  }
};
