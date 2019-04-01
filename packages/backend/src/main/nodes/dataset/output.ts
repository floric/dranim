import {
  Dataset,
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DataType,
  NodeOutputResult,
  OutputNodeForm,
  ServerNodeDef
} from '@masterthesis/shared';

import { isOutputFormValid } from '../../calculation/utils';
import { addValueSchema, createDataset } from '../../workspace/dataset';
import { createManyEntriesWithDataset } from '../../workspace/entry';
import { bufferTime } from 'rxjs/operators';
import { Log } from '../../../logging';

export const DatasetOutputNode: ServerNodeDef<
  DatasetOutputNodeInputs,
  {},
  OutputNodeForm,
  NodeOutputResult<Dataset>
> = {
  type: DatasetOutputNodeDef.type,
  isFormValid: isOutputFormValid,
  onMetaExecution: () => Promise.resolve({}),
  onNodeExecution: async (form, inputs, { reqContext }) => {
    const ds = await createDataset(form.name!, reqContext);
    for (const s of inputs.dataset.schema) {
      await addValueSchema(ds.id, s, reqContext);
    }
    console.log('Started saving');
    await new Promise(resolve => {
      inputs.dataset.entries
        .pipe(bufferTime(1000, undefined, 100000))
        .subscribe(
          batchedValues => {
            Log.info(
              `Writing ${batchedValues.length} entries to Dataset ${ds.id}`
            );
            createManyEntriesWithDataset(ds, batchedValues, reqContext, {
              skipSchemaValidation: true
            });
          },
          error => {},
          resolve
        );
    });
    console.log('Finished saving');

    return {
      outputs: {},
      results: {
        name: form.name!,
        value: { ...ds, name: form.name! },
        type: DataType.DATASET,
        description: form.description || ''
      }
    };
  }
};
