import { NodeDef } from '../AllNodes';
import { StringSocket, STRING_TYPE } from '../Sockets';

export const StringInputNode: NodeDef = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String')],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
