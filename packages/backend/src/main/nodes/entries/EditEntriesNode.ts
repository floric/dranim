import {
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';
import { createDataset } from '../../workspace/dataset';

export const EditEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: EditEntriesNodeDef.name,
  transformContextInputDefsToContextOutputDefs: async (
    inputDefs,
    inputs,
    contextInputDefs
  ) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return {};
    }

    return contextInputDefs;
  },
  transformInputDefsToContextInputDefs: async (inputDefs, inputs, db) => {
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
  isInputValid: async inputs => {
    if (!inputs.dataset || !inputs.dataset.datasetId) {
      return false;
    }

    return true;
  },
  onMetaExecution: async (form, inputs, db) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return inputs;
  },
  onServerExecution: async (form, inputs, db) => {
    const newDs = await createDataset(db, 'random-name-edit');

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
