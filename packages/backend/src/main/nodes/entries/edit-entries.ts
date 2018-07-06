import {
  allAreDefinedAndPresent,
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

import { createDynamicDatasetName } from '../../calculation/utils';
import { createDataset, tryGetDataset } from '../../workspace/dataset';
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
  onNodeExecution: async (
    form,
    inputs,
    { reqContext, contextFnExecution, node: { workspaceId, id } }
  ) => {
    const oldDs = await tryGetDataset(inputs.dataset.datasetId, reqContext);
    const newDs = await createDataset(
      createDynamicDatasetName(EditEntriesNodeDef.type, id),
      reqContext,
      workspaceId
    );
    await copySchemas(oldDs.valueschemas, newDs.id, reqContext);

    await processEntries(
      inputs.dataset.datasetId,
      id,
      async entry => {
        const result = await contextFnExecution!(entry.values);
        await createEntry(newDs.id, result.outputs, reqContext);
      },
      reqContext
    );

    return {
      outputs: {
        dataset: {
          datasetId: newDs.id
        }
      }
    };
  }
};
