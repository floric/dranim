import {
  GetNumberNodeDef,
  GetNumberNodeOutputs,
  GetterNodeInputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../all-nodes';

export const GetNumberNode: ClientNodeDef<
  GetterNodeInputs,
  GetNumberNodeOutputs
> = {
  name: GetNumberNodeDef.name
};
