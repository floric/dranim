import { NodeDef } from '../nodes';
import { DatasetSocket } from '../sockets';

export interface DatasetRef {
  datasetId: string;
}

export interface DatasetInputNodeOutputs {
  dataset: DatasetRef;
}

export interface DatasetInputNodeForm {
  dataset: string;
}

export const DatasetInputNodeDef: NodeDef<{}, DatasetInputNodeOutputs> = {
  name: 'Dataset Input',
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
  inputs: {
    datasetA: DatasetSocket('Dataset A'),
    datasetB: DatasetSocket('Dataset B')
  },
  outputs: {
    joined: DatasetSocket('Joined')
  },
  path: ['Dataset', 'Operators'],
  keywords: []
};

export interface DatasetOutputNodeInputs {
  dataset: DatasetRef;
}

export interface DatasetOutputNodeResults {
  dataset: DatasetRef;
}

export const DatasetOutputNodeDef: NodeDef<DatasetOutputNodeInputs, {}> = {
  name: 'Dataset Output',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  isOutputNode: true,
  outputs: {},
  path: ['Dataset'],
  keywords: []
};
