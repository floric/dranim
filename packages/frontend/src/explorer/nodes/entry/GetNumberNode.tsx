import * as React from 'react';

import {
  GetNumberNodeDef,
  GetNumberNodeOutputs,
  GetterNodeInputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../AllNodes';

export const GetNumberNode: ClientNodeDef<
  GetterNodeInputs,
  GetNumberNodeOutputs
> = {
  name: GetNumberNodeDef.name,
  renderFormItems: () => <p />
};
