import {
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../all-nodes';

export const EditEntriesNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  {}
> = {
  name: EditEntriesNodeDef.name
};
