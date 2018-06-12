import {
  AddValuesNodeDef,
  AddValuesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../workspace/dataset';
import { createEntry } from '../../workspace/entry';
import {
  copySchemas,
  getDynamicEntryContextInputs,
  processEntries
} from './utils';

export const AddValuesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  AddValuesNodeForm
> = {
  type: AddValuesNodeDef.type,
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
      dynOutputs[f.name] = {
        dataType: f.type,
        displayName: f.name,
        isDynamic: true
      };
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

    return {
      dataset: {
        content: {
          schema: [...inputs.dataset.content.schema, ...(form.values || [])]
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (form, inputs, { db, onContextFnExecution, node }) => {
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    const newDs = await createDataset(
      db,
      createDynamicDatasetName(AddValuesNodeDef.type, node.id)
    );

    await copySchemas(oldDs.valueschemas, newDs.id, db);
    await addDynamicSchemas(newDs.id, form.values || [], db);

    if (onContextFnExecution) {
      await processEntries(db, inputs.dataset.datasetId, async entry => {
        const result = await onContextFnExecution(entry.values);
        await createEntry(db, newDs.id, result.outputs);
      });
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

const addDynamicSchemas = async (
  dsId: string,
  formValues: Array<ValueSchema>,
  db: Db
) => {
  await Promise.all(formValues.map(f => addValueSchema(db, dsId, f)));
};
