import { NodeOptions } from '../AllNodes';
import { StringSocket, OutputSocketInformation, STRING_TYPE } from '../Sockets';

export const SubStringNode: NodeOptions = {
  title: 'Substring',
  inputs: [StringSocket('String', 'input')],
  outputs: [StringSocket('String', 'output')],
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['String', { dataType: STRING_TYPE }]
    ]),
  path: ['String', 'Operators'],
  keywords: []
};
