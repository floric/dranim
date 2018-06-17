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
  type: DatasetOutputNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return {
        dataset: { content: { schema: [] }, isPresent: false }
      };
    }

    return inputs;
  },
  onNodeExecution: async (form, inputs, { db }) => {
    await validateDataset(inputs.dataset.datasetId, db);

    return {
      outputs: {},
      results: { dataset: inputs.dataset }
    };
  }
};
