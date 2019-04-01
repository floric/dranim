import {
  allAreDefinedAndPresent,
  DataType,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  NodeOutputResult,
  ServerNodeDefWithContextFn,
  SocketState
} from '@masterthesis/shared';

import { getDynamicEntryContextInputs } from './utils';
import { filter, flatMap, map } from 'rxjs/operators';

export const FilterEntriesNode: ServerNodeDefWithContextFn<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  {},
  NodeOutputResult,
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
  onNodeExecution: async (form, inputs, { contextFnExecution }) => {
    return {
      outputs: {
        dataset: {
          entries: inputs.dataset.entries.pipe(
            flatMap(async e => {
              const {
                outputs: { keepEntry }
              } = await contextFnExecution!(e);
              return {
                keepEntry,
                data: e
              };
            }),
            filter(n => n.keepEntry),
            map(n => n.data)
          ),
          schema: inputs.dataset.schema
        }
      }
    };
  }
};
