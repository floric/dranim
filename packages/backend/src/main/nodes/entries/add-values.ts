import {
  AddValuesNodeDef,
  AddValuesNodeForm,
  Entry,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  NodeExecutionResult,
  ServerNodeDefWithContextFn,
  sleep,
  SocketDef,
  Values
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../calculation/utils';
import { createDataset, getDataset } from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';
import { copySchemas, getDynamicEntryContextInputs } from './utils';

export const AddValuesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  AddValuesNodeForm
> = {
  name: AddValuesNodeDef.name,
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs,
    contextInputs,
    form
  ) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return {};
    }

    if (!form.values) {
      return contextInputDefs;
    }

    const dynOutputs: { [name: string]: SocketDef } = {};
    form.values.forEach(f => {
      dynOutputs[f.displayName] = f;
    });

    return { ...contextInputDefs, ...dynOutputs };
  },
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  isInputValid: async inputs => {
    if (!inputs.dataset || !inputs.dataset.datasetId) {
      return false;
    }

    return true;
  },
  isFormValid: async form => {
    if (!form.values || form.values.length === 0) {
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
      createDynamicDatasetName(AddValuesNodeDef.name, node.id)
    );
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    await copySchemas(oldDs.valueschemas, newDs.id, db);

    // TODO add new schemas

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