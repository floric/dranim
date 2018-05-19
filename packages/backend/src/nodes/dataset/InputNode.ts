import { DatasetInputNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const DatasetInputNode: ServerNodeDef = {
  name: DatasetInputNodeDef.name,
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
