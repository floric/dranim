import * as React from 'react';

import {
  GetDateNodeDef,
  GetDateNodeOutputs,
  GetterNodeInputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../AllNodes';

export const GetDateNode: ClientNodeDef<
  GetterNodeInputs,
  GetDateNodeOutputs
> = {
  name: GetDateNodeDef.name,
  renderFormItems: () => <p />
};
