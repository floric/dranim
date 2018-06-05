import {
  DataType,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

import { createDataset } from '../../workspace/dataset';

export const FilterEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: FilterEntriesNodeDef.name,
  transformInputDefsToContextInputDefs: async (inputDefs, inputs) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
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
      keepEntries: { dataType: DataType.BOOLEAN, displayName: 'Keep entries' }
    }),
  isInputValid: async inputs => {
    if (!inputs.dataset || !inputs.dataset.datasetId) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return inputs;
  },
  onServerExecution: async (form, inputs, db) => {
    const newDs = await createDataset(db, 'random-name-filter');

    // TODO
    // * execute context functions

    return {
      outputs: {
        dataset: {
          datasetId: newDs.id
        }
      }
    };
  }
};
