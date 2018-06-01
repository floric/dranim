import {
  FilterEntriesFnInputs,
  FilterEntriesFnOutputs,
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeWithContextFnDef } from '../all-nodes';

export const FilterEntriesNode: ClientNodeWithContextFnDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  {},
  FilterEntriesFnInputs,
  FilterEntriesFnOutputs
> = {
  name: FilterEntriesNodeDef.name,
  onClientBeforeContextFnExecution: (inputs, form) => ({
    entry: inputs.dataset
  }),
  onClientAfterContextFnExecution: (inputs, originalInputs) => ({
    dataset: originalInputs.dataset
  })
};
