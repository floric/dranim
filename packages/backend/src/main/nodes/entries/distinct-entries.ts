import {
  allAreDefinedAndPresent,
  DistinctEntriesNodeDef,
  DistinctEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDefs,
  ValueSchema
} from '@masterthesis/shared';

import { createDynamicDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  tryGetDataset
} from '../../workspace/dataset';
import { createEntry, getEntryCollection } from '../../workspace/entry';

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
        isDynamic: true
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
          isDynamic: true
        };
      });
    }
    return { ...contextInputDefs, ...contextOutputDefs };
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
    await tryGetDataset(inputs.dataset.datasetId, reqContext);
    const newDs = await createDataset(
      createDynamicDatasetName(DistinctEntriesNodeDef.type, id),
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
      const distinctValue = doc._id;
      const values = {
        [getDistinctValueName(form.schema!)]: distinctValue
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
