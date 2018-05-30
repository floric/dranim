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
  onServerExecution: async (form, inputs, db) => {
    await validateDataset(inputs.dataset.id, db);

    return {
      outputs: {},
      results: { dataset: { id: inputs.dataset.id } }
    };
  }
};
