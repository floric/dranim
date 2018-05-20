import {
  DatasetOutputNodeDef,
  ServerNodeDef,
  DatasetOutputNodeInputs
} from '@masterthesis/shared';

export const DatasetOutputNode: ServerNodeDef<DatasetOutputNodeInputs, {}> = {
  name: DatasetOutputNodeDef.name,
  onServerExecution: () =>
    Promise.resolve({
      outputs: {}
    })
};
