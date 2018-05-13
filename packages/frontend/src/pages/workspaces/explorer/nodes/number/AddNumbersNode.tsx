import { NodeDef } from '../AllNodes';
import { NumberSocket, OutputSocketInformation, NUMBER_TYPE } from '../Sockets';

export const AddNumbersNode: NodeDef = {
  title: 'Add Numbers',
  inputs: [NumberSocket('A'), NumberSocket('B')],
  outputs: [NumberSocket('Sum')],
  path: ['Number', 'Operators'],
  keywords: ['sum', 'add'],
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Sum', { dataType: NUMBER_TYPE }]
    ])
};
