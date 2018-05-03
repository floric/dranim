import { DataSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

export const DatasetInputNode: NodeOptions = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset']
};

export const DatasetOutputNode: NodeOptions = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [],
  path: ['Dataset']
};

export const DatasetSelectValuesNode: NodeOptions = {
  title: 'Select Values',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset', 'Filters']
};

export const AllDatasetNodes = [
  DatasetInputNode,
  DatasetOutputNode,
  DatasetSelectValuesNode
];
