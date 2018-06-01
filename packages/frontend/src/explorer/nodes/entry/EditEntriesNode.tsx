import * as React from 'react';

import {
  EditEntriesNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../AllNodes';

export const EditEntriesNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: EditEntriesNodeDef.name,
  renderFormItems: () => <p />
};
