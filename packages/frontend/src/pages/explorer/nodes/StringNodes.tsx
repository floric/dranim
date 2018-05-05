import {
  StringSocket,
  NumberSocket,
  OutputSocketInformation,
  NUMBER_TYPE,
  STRING_TYPE
} from './Sockets';
import { NodeOptions } from './BasicNodes';

export const StringLengthNode: NodeOptions = {
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

export const AllStringNodes = [StringLengthNode, SubStringNode];
