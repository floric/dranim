import {
  DataType,
  Entry,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  NodeExecutionResult,
  ServerNodeDefWithContextFn,
  sleep,
  Values,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getCreatedDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';

export const FilterEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: FilterEntriesNodeDef.name,
  transformInputDefsToContextInputDefs: async (inputDefs, inputs) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return {};
    }

    const dynInputDefs = {};
    inputs.dataset.content.schema.forEach(s => {
      dynInputDefs[s.name] = {
        dataType: s.type,
        displayName: s.name,
        isDynamic: true
      };
    });

    return dynInputDefs;
  },
  transformContextInputDefsToContextOutputDefs: () =>
    Promise.resolve({
      keepEntry: { dataType: DataType.BOOLEAN, displayName: 'Keep entry' }
    }),
  isInputValid: async inputs => {
    if (!inputs.dataset || !inputs.dataset.datasetId) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return inputs;
  },
  onNodeExecution: async (form, inputs, db, context) => {
    const newDs = await createDataset(
      db,
      getCreatedDatasetName(FilterEntriesNodeDef.name)
    );
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    await copySchemas(oldDs.valueschemas, newDs.id, db);

    if (context) {
      await copyFilteredToOtherDataset(
        db,
        inputs.dataset.datasetId,
        newDs.id,
        context.onContextFnExecution
      );
    } else {
      throw new Error('Missing context');
    }

    return {
      outputs: {
        dataset: {
          datasetId: newDs.id
        }
      }
    };
  }
};

const copySchemas = (schemas: Array<ValueSchema>, newDsId: string, db: Db) =>
  Promise.all(schemas.map(s => addValueSchema(db, newDsId, s)));

const copyFilteredToOtherDataset = async (
  db: Db,
  oldDsId: string,
  newDsId: string,
  onContextFnExecution: (inputs: Values) => Promise<NodeExecutionResult<any>>
) => {
  const oldCollection = getEntryCollection(db, oldDsId);

  return new Promise((resolve, reject) => {
    const col = oldCollection.find();
    col.on('data', async (entry: Entry) => {
      const result = await onContextFnExecution(entry.values);
      if (result.outputs.keepEntry) {
        createEntry(db, newDsId, entry.values);
      }
    });
    col.on('end', async () => {
      await sleep(500);
      resolve();
    });
    col.on('error', () => {
      reject();
    });
  });
};
