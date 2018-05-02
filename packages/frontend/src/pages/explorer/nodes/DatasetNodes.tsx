import { DataSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

export const DatasetInputNode: NodeOptions = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset', 'output')]
};

export const DatasetOutputNode: NodeOptions = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: []
};

export const DatasetSelectValuesNode: NodeOptions = {
  title: 'Select Values',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [DataSocket('Dataset', 'output')]
};

export const AllDatasetNodes = [
  DatasetInputNode,
  DatasetOutputNode,
  DatasetSelectValuesNode
];
