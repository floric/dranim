import { NodeDef } from '../AllNodes';
import { StringSocket } from '../Sockets';

export const StringOutputNode: NodeDef = {
  title: 'String Output',
  inputs: [StringSocket('String')],
  outputs: [],
  path: ['String'],
  keywords: [],
  onClientExecution: () => new Map()
};
