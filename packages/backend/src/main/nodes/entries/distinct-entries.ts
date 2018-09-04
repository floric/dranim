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
  NodeInstance,
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
import { processDocumentsWithCursor } from './utils';

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
    { reqContext, contextFnExecution, node }
  ) => {
    const [existingDs, newDs] = await Promise.all([
      tryGetDataset(inputs.dataset.datasetId, reqContext),
      createDataset(
        createUniqueDatasetName(DistinctEntriesNodeDef.type, node.id),
        reqContext,
        node.workspaceId
      )
    ]);

    await Promise.all(
      [
        ...form.distinctSchemas!.map(s => ({
          ...s,
          name: getDistinctValueName(s)
        })),
        ...form.addedSchemas!
      ].map(s => addValueSchema(newDs.id, s, reqContext))
    );

    const entryColl = getEntryCollection(existingDs.id, reqContext.db);
    const aggregateNames = {};
    form.distinctSchemas!.map(s => s.name).forEach(s => {
      aggregateNames[s] = `$values.${s}`;
    });

    const cursor = entryColl.aggregate([{ $group: { _id: aggregateNames } }]);
    await processDocumentsWithCursor(cursor, doc =>
      processDistinctDatasets(
        doc!._id,
        form.distinctSchemas!,
        existingDs,
        newDs,
        node,
        contextFnExecution!,
        reqContext
      )
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

const processDistinctDatasets = async (
  distinctValues: { [name: string]: any },
  distinctSchemas: Array<ValueSchema>,
  existingDs: Dataset,
  newDs: Dataset,
  node: NodeInstance,
  contextFnExecution: (input: IOValues<any>) => any,
  reqContext: ApolloContext
) => {
  const tempDs = await createDataset(
    createUniqueDatasetName(DistinctEntriesNodeDef.name, node.id),
    reqContext,
    node.workspaceId
  );

  const query = {};
  const values: IOValues<any> = {};
  distinctSchemas!.forEach(s => {
    query[`values.${s.name}`] = distinctValues[s.name];
    values[getDistinctValueName(s)] = distinctValues[s.name];
  });
  values.filteredDataset = {
    datasetId: tempDs.id
  };

  const entryColl = getEntryCollection(existingDs.id, reqContext.db);
  await entryColl
    .aggregate(
      [
        { $match: query },
        { $out: getEntryCollection(tempDs.id, reqContext.db).collectionName }
      ],
      { bypassDocumentValidation: true }
    )
    .next();

  const { outputs } = await contextFnExecution!(values);
  await Promise.all([
    createEntry(newDs.id, outputs, reqContext),
    deleteDataset(tempDs.id, reqContext)
  ]);
};
