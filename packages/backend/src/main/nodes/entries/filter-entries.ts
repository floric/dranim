import {
  allAreDefinedAndPresent,
  DataType,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketState,
  Values
} from '@masterthesis/shared';

import {
  getDynamicEntryContextInputs,
  updateNodeProgressWithSleep
} from './utils';

export const FilterEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  {},
  {},
  { keepEntry: boolean }
> = {
  type: FilterEntriesNodeDef.type,
  transformInputDefsToContextInputDefs: getDynamicEntryContextInputs,
  transformContextInputDefsToContextOutputDefs: async () => ({
    keepEntry: {
      dataType: DataType.BOOLEAN,
      displayName: 'Keep entry',
      state: SocketState.STATIC
    }
  }),
  onMetaExecution: async (form, inputs) => {
    if (!allAreDefinedAndPresent(inputs)) {
      return { dataset: { content: { schema: [] }, isPresent: false } };
    }

    return inputs;
  },
  onNodeExecution: async (
    form,
    inputs,
    { contextFnExecution, node: { id }, reqContext }
  ) => {
    const entries: Array<Values> = [];

    let i = 0;
    for (const e of inputs.dataset.entries) {
      const {
        outputs: { keepEntry }
      } = await contextFnExecution!(e);
      await updateNodeProgressWithSleep(
        i,
        inputs.dataset.entries.length,
        id,
        reqContext
      );
      if (keepEntry) {
        entries.push(e);
      }
      i++;
    }

    return {
      outputs: {
        dataset: {
          entries,
          schema: inputs.dataset.schema
        }
      }
    };
  }
};
