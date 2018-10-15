import { NodeDef } from '../nodes';
import { DatasetSocket } from '../sockets';
import { Values, ValueSchema } from '../workspace';

export interface DatasetRef {
  entries: Array<Values>;
  schema: Array<ValueSchema>;
}

export interface DatasetInputNodeOutputs {
  dataset: DatasetRef;
}

export interface DatasetInputNodeForm {
  dataset: string;
}

export const DatasetInputNodeDef: NodeDef<{}, DatasetInputNodeOutputs> = {
  name: 'Input Table',
  type: 'DatasetInput',
  inputs: {},
  outputs: { dataset: DatasetSocket('Table') },
  path: ['Table'],
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
  name: 'Join Tables',
  type: 'JoinDatasets',
  inputs: {
    datasetA: DatasetSocket('Table A'),
    datasetB: DatasetSocket('Table B')
  },
  outputs: {
    joined: DatasetSocket('Joined')
  },
  path: ['Table', 'Aggregation'],
  keywords: []
};

export interface DatasetOutputNodeInputs {
  dataset: DatasetRef;
}

export const DatasetOutputNodeDef: NodeDef<DatasetOutputNodeInputs> = {
  name: 'Output Table',
  type: 'DatasetOutput',
  inputs: {
    dataset: DatasetSocket('Table')
  },
  isOutputNode: true,
  outputs: {},
  path: ['Table'],
  keywords: []
};
