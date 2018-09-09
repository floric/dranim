import {
  allAreDefinedAndPresent,
  ApolloContext,
  EditEntriesNodeDef,
  EditEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDef,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import { createUniqueDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  tryGetDataset
} from '../../workspace/dataset';
import { createEntry } from '../../workspace/entry';
import { getDynamicEntryContextInputs, processEntries } from './utils';

export const EditEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  EditEntriesNodeForm
> = {
  type: EditEntriesNodeDef.type,
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs,
    contextInputs,
    form
  ) => {
    if (!form.values) {
      return contextInputDefs;
    }

    const dynOutputs: { [name: string]: SocketDef } = {};
    form.values.forEach(f => {
      dynOutputs[f.name] = {
        dataType: f.type,
        displayName: f.name,
        state: SocketState.DYNAMIC
      };
    });

    return dynOutputs;
  },
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  onMetaExecution: async (form, inputs, db) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return {
      dataset: {
        content: {
          schema: form.values || inputs.dataset.content.schema
        },
        isPresent: true
      }
    };
  },
  onNodeExecution: async (
    form,
    inputs,
    { reqContext, contextFnExecution, node: { workspaceId, id } }
  ) => {
    const [oldDs, newDs] = await Promise.all([
      tryGetDataset(inputs.dataset.datasetId, reqContext),
      createDataset(
        createUniqueDatasetName(EditEntriesNodeDef.type, id),
        reqContext,
        workspaceId
      )
    ]);

    await addDynamicSchemas(
      newDs.id,
      form.values || oldDs.valueschemas,
      reqContext
    );

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

const addDynamicSchemas = (
  dsId: string,
  formValues: Array<ValueSchema>,
  reqContext: ApolloContext
) => Promise.all(formValues.map(f => addValueSchema(dsId, f, reqContext)));
