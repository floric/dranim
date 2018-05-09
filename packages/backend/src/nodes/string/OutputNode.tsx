import { NodeDef } from '../AllNodes';
import { StringSocket } from '../Sockets';

export const StringOutputNode: NodeDef = {
  title: 'String Output',
  inputs: [StringSocket('String')],
  outputs: [],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
