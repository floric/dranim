import { NodeDef } from '../AllNodes';
import { NumberSocket, NUMBER_TYPE } from '../Sockets';

export const NumberInputNode: NodeDef = {
  title: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number')],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
