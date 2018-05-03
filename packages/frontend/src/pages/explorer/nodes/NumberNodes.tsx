import { StringSocket, NumberSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

export const FormatNumberNode: NodeOptions = {
  title: 'Format Number',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [StringSocket('Formatted', 'output')],
  path: ['Number', 'Converters']
};

export const AllNumberNodes = [FormatNumberNode];
