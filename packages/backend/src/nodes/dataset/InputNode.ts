import { DataSocket } from '../Sockets';
import { ServerNodeDef } from '../AllNodes';

export const DatasetInputNode: ServerNodeDef = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset')],
  path: ['Dataset'],
  keywords: [],
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
