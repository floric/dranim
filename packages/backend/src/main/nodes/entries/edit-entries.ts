import {
  allAreDefinedAndPresent,
  EditEntriesNodeDef,
  EditEntriesNodeForm,
  Entry,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDef,
  SocketState
} from '@masterthesis/shared';

import { getDynamicEntryContextInputs } from './utils';

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
  onMetaExecution: async (form, inputs) => {
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
  onNodeExecution: async (form, inputs, { contextFnExecution }) => {
    const entries: Array<Entry> = [];
    for (const e of inputs.dataset.entries) {
      const res = await contextFnExecution!(e.values);
      entries.push({ id: '', values: res.outputs });
    }

    return {
      outputs: {
        dataset: {
          entries,
          schema: form.values || inputs.dataset.schema
        }
      }
    };
  }
};
