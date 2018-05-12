import { NodeDef } from '../AllNodes';
import { StringSocket } from '../Sockets';

export const StringOutputNode: NodeDef = {
  title: 'String Output',
  inputs: [StringSocket('String', 'input')],
  outputs: [],
  path: ['String'],
  keywords: [],
  onClientExecution: () => new Map()
};
