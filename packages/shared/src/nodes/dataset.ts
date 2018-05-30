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

export interface FilterDatasetNodeInputs {
  dataset: DatasetRef;
}

export interface FilterDatasetNodeOutputs {
  dataset: DatasetRef;
}

export interface ConditionRule<T> {
  name: string;
  value: T;
}

export interface FilterDatasetNodeForm {
  conditions: {
    equals: Array<ConditionRule<string>>;
    greaterThan: Array<ConditionRule<string>>;
    lessThan: Array<ConditionRule<string>>;
    isPresent: Array<ConditionRule<boolean>>;
  };
}

export const FilterDatasetNodeDef: NodeDef<
  FilterDatasetNodeInputs,
  FilterDatasetNodeOutputs
> = {
  name: 'Filter Dataset',
  inputs: {
    dataset: DataSocket('Dataset')
  },
  outputs: {
    dataset: DataSocket('Dataset')
  },
  path: ['Dataset', 'Filters'],
  keywords: []
};
