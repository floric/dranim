import { DatasetOutputNodeDef, ServerNodeDef } from '@masterthesis/shared';

export const DatasetOutputNode: ServerNodeDef = {
  name: DatasetOutputNodeDef.name,
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
