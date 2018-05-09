import { DataSocket, DATASET_TYPE } from '../Sockets';
import { NodeDef } from '../AllNodes';

export const DatasetInputNode: NodeDef = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset')],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
