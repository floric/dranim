import {
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

import { createDynamicDatasetName } from '../../calculation/utils';
import { createDataset, getDataset } from '../../workspace/dataset';
import { createEntry } from '../../workspace/entry';
import {
  copySchemas,
  getDynamicEntryContextInputs,
  processEntries
} from './utils';

export const EditEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  type: EditEntriesNodeDef.type,
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
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
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
      createDynamicDatasetName(EditEntriesNodeDef.type, node.id)
    );
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    await copySchemas(oldDs.valueschemas, newDs.id, db);

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
