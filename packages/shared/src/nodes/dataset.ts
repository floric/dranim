import { NodeDef } from '../nodes';
import { DataSocket } from '../sockets';

export interface DatasetRef {
  id: string;
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
  outputs: { dataset: DataSocket('Dataset') },
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
    datasetA: DataSocket('Dataset A'),
    datasetB: DataSocket('Dataset B')
  },
  outputs: {
    joined: DataSocket('Joined')
  },
  path: ['Dataset', 'Operators'],
  keywords: []
};

export interface SelectValuesNodeInputs {
  dataset: DatasetRef;
}

export interface SelectValuesNodeOutputs {
  dataset: DatasetRef;
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
    dataset: DataSocket('Dataset')
  },
  outputs: {},
  path: ['Dataset'],
  keywords: []
};
