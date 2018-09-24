import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef,
  Values
} from '@masterthesis/shared';

import { getDataset, tryGetDataset } from '../../workspace/dataset';
import { getEntriesCount } from '../../workspace/entry';
import { processEntries, updateNodeProgressWithSleep } from '../entries/utils';

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
  onNodeExecution: async (form, inputs, { reqContext, node: { id } }) => {
    const [ds, entriesCount] = await Promise.all([
      tryGetDataset(form.dataset!, reqContext),
      getEntriesCount(form.dataset!, reqContext)
    ]);

    let i = 0;
    const entries: Array<Values> = [];
    await processEntries(
      form.dataset!,
      async e => {
        entries.push(e.values);
        await updateNodeProgressWithSleep(i, entriesCount, id, reqContext);
        i++;
      },
      reqContext
    );

    return {
      outputs: {
        dataset: {
          entries,
          schema: ds.valueschemas
        }
      }
    };
  }
};
