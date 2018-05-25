import {
  MultiplicationNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../AllNodes';

export const MultiplicationNode: ClientNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: MultiplicationNodeDef.name
};
