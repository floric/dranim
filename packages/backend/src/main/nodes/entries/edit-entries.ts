import {
  allAreDefinedAndPresent,
  EditEntriesNodeDef,
  EditEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketDef,
  SocketState,
  Values
} from '@masterthesis/shared';

import {
  getDynamicEntryContextInputs,
  updateNodeProgressWithSleep
} from './utils';

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
  onNodeExecution: async (
    form,
    inputs,
    { contextFnExecution, node: { id }, reqContext }
  ) => {
    const entries: Array<Values> = [];
    let i = 0;
    for (const e of inputs.dataset.entries) {
      const res = await contextFnExecution!(e);
      entries.push(res.outputs);
      await updateNodeProgressWithSleep(
        i,
        inputs.dataset.entries.length,
        id,
        reqContext
      );
      i += 1;
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
