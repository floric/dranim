import {
  allAreDefinedAndPresent,
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
    if (!allAreDefinedAndPresent(inputs)) {
      return {};
    }

    return contextInputDefs;
  },
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return inputs;
  },
  onNodeExecution: async (form, inputs, { db, contextFnExecution, node }) => {
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    const newDs = await createDataset(
      db,
      createDynamicDatasetName(EditEntriesNodeDef.type, node.id),
      node.workspaceId
    );
    await copySchemas(oldDs.valueschemas, newDs.id, db);

    if (contextFnExecution) {
      await processEntries(db, inputs.dataset.datasetId, async entry => {
        const result = await contextFnExecution(entry.values);
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
