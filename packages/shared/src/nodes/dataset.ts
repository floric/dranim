import { NodeDef, Dataset } from '../interfaces';
import { DataSocket } from '../sockets';

export interface DatasetInputNodeOutputs {
  dataset: Dataset;
}

export const DatasetInputNodeDef: NodeDef<{}, DatasetInputNodeOutputs> = {
  name: 'Dataset Input',
  inputs: {},
  outputs: { dataset: DataSocket('Dataset') },
  path: ['Dataset'],
  keywords: []
};

export interface JoinDatasetsNodeInputs {
  datasetA: Dataset;
  datasetB: Dataset;
}

export interface JoinDatasetsNodeOutputs {
  joined: Dataset;
}

export const JoinDatasetsNodeDef: NodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs
> = {
  name: 'Join Datasets',
  inputs: {
    datasetA: DataSocket('Dataset A'),
    datasetB: DataSocket('Dataset B')
  },
  outputs: {
    joined: DataSocket('Joined')
  },
  path: ['Dataset'],
  keywords: []
};

export interface SelectValuesNodeInputs {
  dataset: Dataset;
}

export interface SelectValuesNodeOutputs {
  dataset: Dataset;
}

export const SelectValuesNodeDef: NodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs
> = {
  name: 'Select Values',
  inputs: {
    dataset: DataSocket('Dataset')
  },
  outputs: {
    dataset: DataSocket('Dataset')
  },
  path: ['Dataset'],
  keywords: []
};

export interface DatasetOutputNodeInputs {
  dataset: Dataset;
}

export const DatasetOutputNodeDef: NodeDef<DatasetOutputNodeInputs, {}> = {
  name: 'Dataset Output',
  inputs: {
    dataset: DataSocket('Dataset')
  },
  outputs: {},
  path: ['Dataset'],
  keywords: []
};
