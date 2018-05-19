import { NodeDef } from '../interfaces';
import { StringSocket } from '../sockets';

export const StringInputNodeDef: NodeDef = {
  name: 'String Input',
  inputs: [],
  outputs: [StringSocket('String')],
  keywords: [],
  path: ['String']
};

export const StringOutputNodeDef: NodeDef = {
  name: 'String Output',
  inputs: [StringSocket('String')],
  outputs: [],
  keywords: [],
  path: ['String']
};
