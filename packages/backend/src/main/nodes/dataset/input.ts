import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs,
  ServerNodeDef
} from '@masterthesis/shared';

import { Observable } from 'rxjs';

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
  onNodeExecution: async (form, inputs, { reqContext, node: { id } }) => {
    const ds = await tryGetDataset(form.dataset!, reqContext);

    const observable = new Observable(subscriber => {
      processEntries(
        form.dataset!,
        e => subscriber.next(e.values),
        reqContext
      ).then(() => subscriber.complete());
    });

    return {
      outputs: {
        dataset: {
          entries: observable,
          schema: ds.valueschemas
        }
      }
    };
  }
};
