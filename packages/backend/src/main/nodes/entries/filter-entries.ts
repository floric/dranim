import {
  allAreDefinedAndPresent,
  DataType,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../calculation/utils';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../workspace/dataset';
import { createEntry } from '../../workspace/entry';
import { processEntries } from './utils';

export const FilterEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  type: FilterEntriesNodeDef.type,
  transformInputDefsToContextInputDefs: async (inputDefs, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return {};
    }

    const dynInputDefs = {};
    inputs.dataset.content.schema.forEach(s => {
      dynInputDefs[s.name] = {
        dataType: s.type,
        displayName: s.name,
        isDynamic: true
      };
    });

    return dynInputDefs;
  },
  transformContextInputDefsToContextOutputDefs: () =>
    Promise.resolve({
      keepEntry: { dataType: DataType.BOOLEAN, displayName: 'Keep entry' }
    }),
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return inputs;
  },
  onNodeExecution: async (form, inputs, { db, contextFnExecution, node }) => {
    const newDs = await createDataset(
      db,
      createDynamicDatasetName(FilterEntriesNodeDef.type, node.id),
      node.workspaceId
    );
    const oldDs = await getDataset(db, inputs.dataset.datasetId);
    if (!oldDs) {
      throw new Error('Unknown dataset source');
    }

    await copySchemas(oldDs.valueschemas, newDs.id, db);

    if (contextFnExecution) {
      await processEntries(db, inputs.dataset.datasetId, async entry => {
        const result = await contextFnExecution(entry.values);
        if (result.outputs.keepEntry) {
          await createEntry(db, newDs.id, entry.values);
        }
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

const copySchemas = (schemas: Array<ValueSchema>, newDsId: string, db: Db) =>
  Promise.all(schemas.map(s => addValueSchema(db, newDsId, s)));
