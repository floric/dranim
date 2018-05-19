import { DataSocket } from '../Sockets';
import { ServerNodeDef } from '../AllNodes';

export const DatasetOutputNode: ServerNodeDef = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset')],
  outputs: [],
  path: ['Dataset'],
  keywords: [],
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
