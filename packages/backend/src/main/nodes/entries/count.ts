import {
  allAreDefinedAndPresent,
  CountEntriesNodeDef,
  CountEntriesNodeInputs,
  CountEntriesNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { tryGetDataset } from '../../workspace/dataset';
import { getEntriesCount } from '../../workspace/entry';

export const CountEntriesNode: ServerNodeDef<
  CountEntriesNodeInputs,
  CountEntriesNodeOutputs
> = {
  type: CountEntriesNodeDef.type,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { count: { content: {}, isPresent: false } };
    }

    return { count: { content: {}, isPresent: true } };
  },
  onNodeExecution: async (form, inputs, { reqContext }) => {
    const ds = await tryGetDataset(inputs.dataset.datasetId, reqContext);

    return {
      outputs: {
        count: await getEntriesCount(ds.id, reqContext)
      }
    };
  }
};
