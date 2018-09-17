import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef,
  Values
} from '@masterthesis/shared';

import { getDataset, tryGetDataset } from '../../workspace/dataset';
import { processEntries } from '../entries/utils';

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
  onNodeExecution: async (form, inputs, { reqContext, node }) => {
    const ds = await tryGetDataset(form.dataset!, reqContext);

    const entries: Array<Values> = [];
    await processEntries(
      form.dataset!,
      async e => {
        entries.push(e.values);
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
