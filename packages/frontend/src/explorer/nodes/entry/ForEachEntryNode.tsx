import * as React from 'react';

import {
  ForEachEntryNodeDef,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../AllNodes';

export const ForEachEntryNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs
> = {
  name: ForEachEntryNodeDef.name,
  renderFormItems: () => <p />
};
