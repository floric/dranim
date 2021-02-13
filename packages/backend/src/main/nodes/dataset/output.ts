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

const MAX_BUFFER_DELAY = 1000;
const MAX_BUFFER_SIZE = 100000;

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

    Log.info(`Started writing dataset ${ds.id}`);

    await new Promise(resolve => {
      inputs.dataset.entries
        .pipe(bufferTime(MAX_BUFFER_DELAY, undefined, MAX_BUFFER_SIZE))
        .subscribe(
          batchedValues => {
            Log.info(
              `Writing ${batchedValues.length} entries to Dataset ${ds.id}`
            );
            createManyEntriesWithDataset(ds, batchedValues, reqContext, {
              skipSchemaValidation: true
            });
          },
          error => {
            throw new Error(`Error occurred on saving entries: ${error}`);
          },
          resolve
        );
    });

    Log.info(`Finished writing dataset ${ds.id}`);

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
