import {
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DatasetOutputNodeResults,
  ServerNodeDef
} from '@masterthesis/shared';

import { validateDataset } from './utils';

export const DatasetOutputNode: ServerNodeDef<
  DatasetOutputNodeInputs,
  {},
  {},
  DatasetOutputNodeResults
> = {
  name: DatasetOutputNodeDef.name,
  isInputValid: inputs =>
    Promise.resolve(!!inputs.dataset && !!inputs.dataset.id),
  onServerExecution: async (form, inputs, db) => {
    await validateDataset(inputs.dataset.id, db);

    return {
      outputs: {},
      results: { dataset: { id: inputs.dataset.id } }
    };
  }
};
