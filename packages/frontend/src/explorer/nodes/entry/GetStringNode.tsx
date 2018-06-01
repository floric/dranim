import {
  GetStringNodeDef,
  GetStringNodeOutputs,
  GetterNodeInputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../all-nodes';

export const GetStringNode: ClientNodeDef<
  GetterNodeInputs,
  GetStringNodeOutputs
> = {
  name: GetStringNodeDef.name
};
