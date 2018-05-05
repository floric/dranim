import { DataSocket } from '../Sockets';
import { NodeOptions } from '../AllNodes';

export const DatasetOutputNode: NodeOptions = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [],
  path: ['Dataset'],
  keywords: [],
  onClientExecution: () => new Map()
};
