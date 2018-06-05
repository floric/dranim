import {
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../all-nodes';

export const FilterEntriesNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  {}
> = {
  name: FilterEntriesNodeDef.name
};
