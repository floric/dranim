import { ServerNodeDef } from '../AllNodes';
import { StringSocket } from '../Sockets';

export const StringInputNode: ServerNodeDef = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String')],
  keywords: [],
  path: ['String'],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
