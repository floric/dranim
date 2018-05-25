import {
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  ServerNodeDef
} from '@masterthesis/shared';

export const DatasetOutputNode: ServerNodeDef<DatasetOutputNodeInputs, {}> = {
  name: DatasetOutputNodeDef.name,
  onServerExecution: () =>
    Promise.resolve({
      outputs: {}
    })
};
