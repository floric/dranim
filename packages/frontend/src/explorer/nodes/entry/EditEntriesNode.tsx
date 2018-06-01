import {
  EditEntriesFnInputs,
  EditEntriesFnOutputs,
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeWithContextFnDef } from '../all-nodes';

export const EditEntriesNode: ClientNodeWithContextFnDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  {},
  EditEntriesFnInputs,
  EditEntriesFnOutputs
> = {
  name: EditEntriesNodeDef.name,
  onClientBeforeContextFnExecution: inputs => ({
    entry: inputs.dataset || null
  }),
  onClientAfterContextFnExecution: inputs => ({
    dataset: inputs.entry || null
  })
};
