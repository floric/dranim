import {
  EditEntriesNodeDef,
  Entry,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  NodeExecutionResult,
  ServerNodeDefWithContextFn,
  sleep,
  Values,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';

export const EditEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: EditEntriesNodeDef.name,
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs
  ) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return {};
    }

    return contextInputDefs;
  },
  transformInputDefsToContextInputDefs: async (inputDefs, inputs, db) => {
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
  isInputValid: async inputs => {
    if (!inputs.dataset || !inputs.dataset.datasetId) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs, db) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return inputs;
  },
  onNodeExecution: async (form, inputs, { db, onContextFnExecution, node }) => {
    const newDs = await createDataset(
      db,
      createDynamicDatasetName(EditEntriesNodeDef.name, node.id)
    );
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    await copySchemas(oldDs.valueschemas, newDs.id, db);

    if (onContextFnExecution) {
      await copyEditedToOtherDataset(
        db,
        inputs.dataset.datasetId,
        newDs.id,
        onContextFnExecution
      );
    } else {
      throw new Error('Missing context function');
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

const copyEditedToOtherDataset = async (
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
      createEntry(db, newDsId, result.outputs);
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
