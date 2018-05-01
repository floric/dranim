import { DataSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

export const DatasetInputNode: NodeOptions = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset')]
};

export const DatasetSelectValuesNode: NodeOptions = {
  title: 'Select Values',
  inputs: [DataSocket('Dataset')],
  outputs: [DataSocket('Dataset')]
};
