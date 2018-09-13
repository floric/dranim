import { NodeDef } from '../nodes';
import { DatasetSocket } from '../sockets';
import { Entry, ValueSchema } from '../workspace';

export interface DatasetRef {
  entries: Array<Entry>;
  schema: Array<ValueSchema>;
}

export interface DatasetInputNodeOutputs {
  dataset: DatasetRef;
}

export interface DatasetInputNodeForm {
  dataset: string;
}

export const DatasetInputNodeDef: NodeDef<{}, DatasetInputNodeOutputs> = {
  name: 'Input Dataset',
  type: 'DatasetInput',
  inputs: {},
  outputs: { dataset: DatasetSocket('Dataset') },
  path: ['Dataset'],
  keywords: []
};

export interface JoinDatasetsNodeInputs {
  datasetA: DatasetRef;
  datasetB: DatasetRef;
}

export interface JoinDatasetsNodeOutputs {
  joined: DatasetRef;
}

export interface JoinDatasetsNodeForm {
  valueA: string;
  valueB: string;
}

export const JoinDatasetsNodeDef: NodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs
> = {
  name: 'Join Datasets',
  type: 'JoinDatasets',
  inputs: {
    datasetA: DatasetSocket('Dataset A'),
    datasetB: DatasetSocket('Dataset B')
  },
  outputs: {
    joined: DatasetSocket('Joined')
  },
  path: ['Dataset', 'Aggregation'],
  keywords: []
};

export interface DatasetOutputNodeInputs {
  dataset: DatasetRef;
}

export const DatasetOutputNodeDef: NodeDef<DatasetOutputNodeInputs, {}> = {
  name: 'Output Dataset',
  type: 'DatasetOutput',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  isOutputNode: true,
  outputs: {},
  path: ['Dataset'],
  keywords: []
};
