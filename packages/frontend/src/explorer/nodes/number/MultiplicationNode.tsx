import {
  MultiplicationNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
} from '@masterthesis/shared';

import { ClientNodeDef } from '../all-nodes';

export const MultiplicationNode: ClientNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: MultiplicationNodeDef.name
};
