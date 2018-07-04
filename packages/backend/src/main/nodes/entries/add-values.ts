import {
  AddValuesNodeDef,
  AddValuesNodeForm,
  allAreDefinedAndPresent,
  ApolloContext,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDef,
  ValueSchema
} from '@masterthesis/shared';

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
    if (!allAreDefinedAndPresent(inputs)) {
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
    const oldDs = await getDataset(inputs.dataset.datasetId, reqContext);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    const newDs = await createDataset(
      createDynamicDatasetName(AddValuesNodeDef.type, id),
      reqContext,
      workspaceId
    );

    await copySchemas(oldDs.valueschemas, newDs.id, reqContext);
    await addDynamicSchemas(newDs.id, form.values || [], reqContext);

    if (contextFnExecution) {
      await processEntries(
        inputs.dataset.datasetId,
        id,
        async entry => {
          const result = await contextFnExecution(entry.values);
          await createEntry(newDs.id, result.outputs, reqContext);
        },
        reqContext
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

const addDynamicSchemas = async (
  dsId: string,
  formValues: Array<ValueSchema>,
  reqContext: ApolloContext
) => Promise.all(formValues.map(f => addValueSchema(dsId, f, reqContext)));
