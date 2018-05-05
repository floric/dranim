import { NumberSocket } from '../Sockets';
import { NodeOptions } from '../AllNodes';

export const NumberOutputNode: NodeOptions = {
  title: 'Number Output',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [],
  path: ['Number'],
  keywords: [],
  onClientExecution: () => new Map()
};
