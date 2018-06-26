import {
  allAreDefinedAndPresent,
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DatasetRef,
  DataType,
  OutputResult,
  ServerNodeDef
} from '@masterthesis/shared';

import { tryGetDataset } from '../../workspace/dataset';

export const DatasetOutputNode: ServerNodeDef<
  DatasetOutputNodeInputs,
  {},
  {},
  OutputResult<DatasetRef>
> = {
  type: DatasetOutputNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {
        dataset: { content: { schema: [] }, isPresent: false }
      };
    }

    return inputs;
  },
  onNodeExecution: async (form, inputs, { db }) => {
    const ds = await tryGetDataset(inputs.dataset.datasetId, db);
    return {
      outputs: {},
      results: {
        name: ds.name,
        value: inputs.dataset,
        type: DataType.DATASET,
        dashboardId: '',
        description: ''
      }
    };
  }
};
