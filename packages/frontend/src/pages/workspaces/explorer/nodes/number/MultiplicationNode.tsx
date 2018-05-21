import { ClientNodeDef } from '../AllNodes';
import {
  MultiplicationNodeDef,
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
} from '@masterthesis/shared';

export const MultiplicationNode: ClientNodeDef<
  MultiplicationNodeInputs,
  MultiplicationNodeOutputs
> = {
  name: MultiplicationNodeDef.name
};
