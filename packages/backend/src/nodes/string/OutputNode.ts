import { ServerNodeDef } from '../AllNodes';
import { StringSocket } from '../Sockets';

export const StringOutputNode: ServerNodeDef = {
  title: 'String Output',
  inputs: [StringSocket('String')],
  outputs: [],
  keywords: [],
  path: ['String'],
  isInputValid: () => Promise.resolve(true),
  onServerExecution: () =>
    Promise.resolve({
      outputs: new Map()
    })
};
