import {
  allAreDefinedAndPresent,
  DataType,
  DistinctEntriesNodeDef,
  DistinctEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDefs,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import { createUniqueDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  tryGetDataset
} from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';
import { copySchemas, processEntries } from './utils';

const getDistinctValueName = (vs: ValueSchema) => `${vs.name}-distinct`;

export const DistinctEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  DistinctEntriesNodeForm,
  {}
> = {
  type: DistinctEntriesNodeDef.type,
  isFormValid: async form => {
    if (!form.schema || !form.newSchemas) {
      return false;
    }

    return true;
  },
  transformInputDefsToContextInputDefs: async (inputDefs, inputs, form) => {
    if (form.schema == null) {
      return {} as any;
    }

    return {
      [getDistinctValueName(form.schema)]: {
        dataType: form.schema.type,
        displayName: getDistinctValueName(form.schema),
        state: SocketState.DYNAMIC
      },
      filteredDataset: {
        dataType: DataType.DATASET,
        displayName: 'Filtered Dataset',
        state: SocketState.DYNAMIC
      }
    };
  },
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs,
    contextInputs,
    form
  ) => {
    const contextOutputDefs: SocketDefs<any> = {};
    if (form.newSchemas) {
      form.newSchemas.forEach(s => {
        contextOutputDefs[s.name] = {
          dataType: s.type,
          displayName: s.name,
          state: SocketState.DYNAMIC
        };
      });
    }
    const { filteredDataset, ...other } = contextInputDefs;
    return { ...other, ...contextOutputDefs };
  },
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs) || !form.schema || !form.newSchemas) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return {
      dataset: {
        content: {
          schema: [
            { ...form.schema!, name: getDistinctValueName(form.schema!) },
            ...form.newSchemas!
          ]
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
    const existingDs = await tryGetDataset(
      inputs.dataset.datasetId,
      reqContext
    );
    const newDs = await createDataset(
      createUniqueDatasetName(DistinctEntriesNodeDef.type, id),
      reqContext,
      workspaceId
    );

    await Promise.all(
      [
        { ...form.schema!, name: getDistinctValueName(form.schema!) },
        ...form.newSchemas!
      ].map(s => addValueSchema(newDs.id, s, reqContext))
    );

    const entryColl = getEntryCollection(
      inputs.dataset.datasetId,
      reqContext.db
    );
    const cursor = entryColl.aggregate([
      { $group: { _id: `$values.${form.schema!.name}` } }
    ]);

    while (await (cursor as any).hasNext()) {
      const doc = await cursor.next();
      const distinctValue = doc!._id;
      const filteredDs = await createDataset(
        'test' + Math.random() * 1000,
        reqContext,
        workspaceId
      );
      await copySchemas(existingDs.valueschemas, filteredDs.id, reqContext);
      await processEntries(
        existingDs.id,
        id,
        async e => {
          if (e.values[form.schema!.name] === distinctValue) {
            await createEntry(filteredDs.id, e.values, reqContext);
          }
        },
        reqContext
      );

      const values = {
        [getDistinctValueName(form.schema!)]: distinctValue,
        filteredDataset: {
          datasetId: filteredDs.id
        }
      };
      const { outputs } = await contextFnExecution!(values);
      await createEntry(newDs.id, outputs, reqContext);
    }

    await cursor.close();

    return {
      outputs: {
        dataset: {
          datasetId: newDs.id
        }
      }
    };
  }
};
