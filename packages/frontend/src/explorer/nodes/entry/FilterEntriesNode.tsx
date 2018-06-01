import * as React from 'react';

import {
  FilterEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../AllNodes';

export const FilterEntriesNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: FilterEntriesNodeDef.name,
  renderFormItems: () => <p />
};
