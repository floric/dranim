import {
  allAreDefinedAndPresent,
  DataType,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ServerNodeDefWithContextFn,
  SocketState
} from '@masterthesis/shared';

import { getDynamicEntryContextInputs } from './utils';

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
  onNodeExecution: async (form, inputs, {}) => {
    return {
      outputs: {
        dataset: {
          entries: [],
          schema: inputs.dataset.schema
        }
      }
    };
  }
};
