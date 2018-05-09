import { DataSocket } from '../Sockets';
import { NodeDef } from '../AllNodes';

export const DatasetOutputNode: NodeDef = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset')],
  outputs: [],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
