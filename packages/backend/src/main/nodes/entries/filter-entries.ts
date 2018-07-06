import {
  allAreDefinedAndPresent,
  ApolloContext,
  DataType,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  ValueSchema
} from '@masterthesis/shared';

import { createDynamicDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  tryGetDataset
} from '../../workspace/dataset';
import { createEntry } from '../../workspace/entry';
import { getDynamicEntryContextInputs, processEntries } from './utils';

export const FilterEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  {},
  {},
  { keepEntry: boolean }
> = {
  type: FilterEntriesNodeDef.type,
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  transformContextInputDefsToContextOutputDefs: async () => ({
    keepEntry: { dataType: DataType.BOOLEAN, displayName: 'Keep entry' }
  }),
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
    const newDs = await createDataset(
      createDynamicDatasetName(FilterEntriesNodeDef.type, id),
      reqContext,
      workspaceId
    );
    const oldDs = await tryGetDataset(inputs.dataset.datasetId, reqContext);

    await copySchemas(oldDs.valueschemas, newDs.id, reqContext);
    await processEntries(
      inputs.dataset.datasetId,
      id,
      async entry => {
        const result = await contextFnExecution!(entry.values);
        if (result.outputs.keepEntry) {
          await createEntry(newDs.id, entry.values, reqContext);
        }
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

const copySchemas = (
  schemas: Array<ValueSchema>,
  newDsId: string,
  reqContext: ApolloContext
) => Promise.all(schemas.map(s => addValueSchema(newDsId, s, reqContext)));
