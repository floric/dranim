import {
  DataType,
  Entry,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  sleep,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

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
      keepEntries: { dataType: DataType.BOOLEAN, displayName: 'Keep entries' }
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
  onServerExecution: async (form, inputs, db, context) => {
    const newDs = await createDataset(db, (Math.random() * 10000).toString());
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    await copySchema(oldDs.valueschemas, newDs.id, db);

    if (context) {
      await copyFilteredToOtherDataset(
        db,
        inputs.dataset.datasetId,
        newDs.id,
        async (entry: Entry) => {
          const res = await context.onContextFnExecution(entry.values);
          return res.outputs.keepEntries;
        }
      );
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

const copySchema = async (
  schemas: Array<ValueSchema>,
  newDsId: string,
  db: Db
) => {
  await Promise.all(schemas.map(s => addValueSchema(db, newDsId, s)));
};

const copyFilteredToOtherDataset = async (
  db: Db,
  oldDsId: string,
  newDsId: string,
  keepEntryFn: (obj: Entry) => Promise<boolean>
) => {
  const oldCollection = getEntryCollection(db, oldDsId);

  return new Promise((resolve, reject) => {
    const col = oldCollection.find();
    col.on('data', async (chunk: Entry) => {
      const keepEntry = await keepEntryFn(chunk);
      if (keepEntry) {
        createEntry(db, newDsId, chunk.values);
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
