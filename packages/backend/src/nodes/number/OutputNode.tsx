import { NumberSocket } from '../Sockets';
import { NodeDef } from '../AllNodes';

export const NumberOutputNode: NodeDef = {
  title: 'Number Output',
  inputs: [NumberSocket('Number')],
  outputs: [],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
