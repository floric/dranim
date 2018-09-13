import {
  Dataset,
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DataType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDef
} from '@masterthesis/shared';
import PromiseQueue from 'promise-queue';

import { isOutputFormValid } from '../../calculation/utils';
import { addValueSchema, createDataset } from '../../workspace/dataset';
import { createEntry } from '../../workspace/entry';

export const DatasetOutputNode: ServerNodeDef<
  DatasetOutputNodeInputs,
  {},
  OutputNodeForm,
  OutputResult<Dataset>
> = {
  type: DatasetOutputNodeDef.type,
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: async (
    form,
    inputs,
    { reqContext, node: { workspaceId } }
  ) => {
    const ds = await createDataset(form.name!, reqContext);
    await Promise.all(
      inputs.dataset.schema.map(async n => {
        await addValueSchema(ds.id, n, reqContext);
      })
    );

    const queue = new PromiseQueue(4);

    for (const n of inputs.dataset.entries) {
      await queue.add(() => createEntry(ds.id, n.values, reqContext));
    }

    return {
      outputs: {},
      results: {
        name: form.name!,
        value: { ...ds, name: form.name! },
        type: DataType.DATASET,
        workspaceId,
        description: form.description || ''
      }
    };
  }
};
