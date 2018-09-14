import {
  Dataset,
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DataType,
  OutputNodeForm,
  OutputResult,
  ServerNodeDef
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { addValueSchema, createDataset } from '../../workspace/dataset';
import { createManyEntries } from '../../workspace/entry';

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
    for (const s of inputs.dataset.schema) {
      await addValueSchema(ds.id, s, reqContext);
    }

    /*await new Promise(resolve => {
      const queue = new PromiseQueue(8, undefined, { onEmpty: resolve });

      for (const n of inputs.dataset.entries) {
        queue.add(() => createEntry(ds.id, n.values, reqContext));
      }
    });*/

    await createManyEntries(
      ds.id,
      inputs.dataset.entries.map(n => n.values),
      reqContext
    );

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
