import { NodeDef } from '../nodes';
import { DataSocket } from '../sockets';
import { Dataset } from '../workspace';

export interface DatasetInputNodeOutputs {
  dataset: Dataset;
}

export interface DatasetInputNodeForm {
  dataset: string;
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

export interface SelectValuesNodeForm {
  values: Array<string>;
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

export interface DatasetOutputNodeResults {
  dataset: 'todo';
}

export interface DatasetOutputNodeForm {
  name: string;
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
