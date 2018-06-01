import {
  GetDateNodeDef,
  GetDateNodeOutputs,
  GetterNodeInputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../all-nodes';

export const GetDateNode: ClientNodeDef<
  GetterNodeInputs,
  GetDateNodeOutputs
> = {
  name: GetDateNodeDef.name
};
