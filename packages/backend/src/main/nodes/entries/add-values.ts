import {
  AddValuesNodeDef,
  AddValuesNodeForm,
  allAreDefinedAndPresent,
  ApolloContext,
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

    return { ...contextInputDefs, ...dynOutputs };
  },
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  isFormValid: async form => {
    if (!form.values || form.values.length === 0) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs, db) => {
    if (!allAreDefinedAndPresent(inputs)) {
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
  onNodeExecution: async (
    form,
    inputs,
    { reqContext, contextFnExecution, node: { workspaceId, id } }
  ) => {
    const oldDs = await tryGetDataset(inputs.dataset.datasetId, reqContext);
    const newDs = await createDataset(
      createUniqueDatasetName(AddValuesNodeDef.type, id),
      reqContext,
      workspaceId
    );

    await copySchemas(oldDs.valueschemas, newDs.id, reqContext);
    await addDynamicSchemas(newDs.id, form.values || [], reqContext);

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

const addDynamicSchemas = async (
  dsId: string,
  formValues: Array<ValueSchema>,
  reqContext: ApolloContext
) => Promise.all(formValues.map(f => addValueSchema(dsId, f, reqContext)));
