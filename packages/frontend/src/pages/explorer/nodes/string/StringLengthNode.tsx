import { NodeDef } from '../AllNodes';
import {
  StringSocket,
  NumberSocket,
  OutputSocketInformation,
  NUMBER_TYPE
} from '../Sockets';

export const StringLengthNode: NodeDef = {
  title: 'String Length',
  inputs: [StringSocket('String', 'input')],
  outputs: [NumberSocket('Length', 'output')],
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Length', { dataType: NUMBER_TYPE }]
    ]),
  path: ['String', 'Operators'],
  keywords: []
};
