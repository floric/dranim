import {
  DatasetInputNodeDef,
  ServerNodeDef,
  DatasetInputNodeOutputs
} from '@masterthesis/shared';

export const DatasetInputNode: ServerNodeDef<{}, DatasetInputNodeOutputs> = {
  name: DatasetInputNodeDef.name,
  onServerExecution: () =>
    Promise.resolve({
      outputs: {
        dataset: ''
      }
    })
};
