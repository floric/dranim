import { StringSocket, NumberSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

export const FormatNumberNode: NodeOptions = {
  title: 'Format Number',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [StringSocket('Formatted', 'output')]
};

export const AllNumberNodes = [FormatNumberNode];
