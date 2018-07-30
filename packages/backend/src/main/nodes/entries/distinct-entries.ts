import {
  allAreDefinedAndPresent,
  ApolloContext,
  Dataset,
  DataType,
  DistinctEntriesNodeDef,
  DistinctEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  IOValues,
  ServerNodeDefWithContextFn,
  SocketDefs,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import { createUniqueDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  deleteDataset,
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
    if (
      !form.distinctSchemas ||
      !form.addedSchemas ||
      form.distinctSchemas.length === 0
    ) {
      return false;
    }

    return true;
  },
  transformInputDefsToContextInputDefs: async (inputDefs, inputs, form) => {
    if (form.distinctSchemas == null) {
      return {} as any;
    }

    const res: SocketDefs<any> = {};
    form.distinctSchemas.forEach(ds => {
      res[getDistinctValueName(ds)] = {
        dataType: ds.type,
        displayName: getDistinctValueName(ds),
        state: SocketState.DYNAMIC
      };
    });

    res.filteredDataset = {
      dataType: DataType.DATASET,
      displayName: 'Filtered Dataset',
      state: SocketState.DYNAMIC
    };

    return res;
  },
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs,
    contextInputs,
    form
  ) => {
    const contextOutputDefs: SocketDefs<any> = {};
    if (form.addedSchemas) {
      form.addedSchemas.forEach(s => {
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
    if (
      !allAreDefinedAndPresent(inputs) ||
      !form.distinctSchemas ||
      form.distinctSchemas.length === 0 ||
      !form.addedSchemas
    ) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return {
      dataset: {
        content: {
          schema: [
            ...form.distinctSchemas.map(s => ({
              ...s,
              name: getDistinctValueName(s)
            })),
            ...form.addedSchemas!
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
        ...form.distinctSchemas!.map(s => ({
          ...s,
          name: getDistinctValueName(s)
        })),
        ...form.addedSchemas!
      ].map(s => addValueSchema(newDs.id, s, reqContext))
    );

    const entryColl = getEntryCollection(
      inputs.dataset.datasetId,
      reqContext.db
    );
    const aggregateNames = {};
    form.distinctSchemas!.map(s => s.name).forEach(s => {
      aggregateNames[s] = `$values.${s}`;
    });

    const cursor = entryColl.aggregate([{ $group: { _id: aggregateNames } }]);

    while (await (cursor as any).hasNext()) {
      const doc = await cursor.next();
      const distinctValues = doc!._id;
      await processDistinctDatasets(
        distinctValues,
        form.distinctSchemas!,
        existingDs,
        newDs,
        workspaceId,
        id,
        contextFnExecution!,
        reqContext
      );
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

const processDistinctDatasets = async (
  distinctValues: { [name: string]: any },
  distinctSchemas: Array<ValueSchema>,
  existingDs: Dataset,
  newDs: Dataset,
  workspaceId: string,
  nodeId: string,
  contextFnExecution: (input: IOValues<any>) => any,
  reqContext: ApolloContext
) => {
  const tempDs = await createDataset(
    createUniqueDatasetName(DistinctEntriesNodeDef.name, nodeId),
    reqContext,
    workspaceId
  );

  const query = {};
  distinctSchemas!.forEach(s => {
    query[`values.${s.name}`] = distinctValues[s.name];
  });

  const entryColl = getEntryCollection(existingDs.id, reqContext.db);
  entryColl.aggregate([
    { $match: query },
    { $out: getEntryCollection(tempDs.id, reqContext.db).collectionName }
  ]);

  const values: IOValues<any> = {};
  distinctSchemas.forEach(ds => {
    values[getDistinctValueName(ds)] = distinctValues[ds.name];
  });

  values.filteredDataset = {
    datasetId: tempDs.id
  };

  const { outputs } = await contextFnExecution!(values);

  await createEntry(newDs.id, outputs, reqContext);
  await deleteDataset(tempDs.id, reqContext);
};
