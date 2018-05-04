import { DataSocket, StringSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

export const DatasetInputNode: NodeOptions = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset'],
  keywords: []
};

export const DatasetOutputNode: NodeOptions = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [],
  path: ['Dataset'],
  keywords: []
};

export const DatasetSelectValuesNode: NodeOptions = {
  title: 'Select Values',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset', 'Filters'],
  keywords: []
};

export const JoinDatasetsNode: NodeOptions = {
  title: 'Join Datasets',
  inputs: [
    DataSocket('Dataset A', 'input'),
    DataSocket('Dataset B', 'input'),
    StringSocket('Index Colum', 'input')
  ],
  outputs: [DataSocket('Combined', 'output')],
  path: ['Dataset', 'Aggregators'],
  keywords: []
};

export const AllDatasetNodes = [
  DatasetInputNode,
  DatasetOutputNode,
  DatasetSelectValuesNode,
  JoinDatasetsNode
];
