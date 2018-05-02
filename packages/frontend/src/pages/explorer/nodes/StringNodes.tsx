import { StringSocket, NumberSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

export const StringLengthNode: NodeOptions = {
  title: 'String Length',
  inputs: [StringSocket('String', 'input')],
  outputs: [NumberSocket('Length', 'output')]
};
