import { NodeDef } from '../interfaces';
import { DataSocket } from '../sockets';

export const DatasetInputNodeDef: NodeDef = {
  name: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset')],
  path: ['Dataset'],
  keywords: []
};

export const JoinDatasetsNodeDef: NodeDef = {
  name: 'Join Datasets',
  inputs: [DataSocket('A'), DataSocket('B')],
  outputs: [DataSocket('Combined')],
  path: ['Dataset'],
  keywords: []
};

export const SelectValuesNodeDef: NodeDef = {
  name: 'Select Values',
  inputs: [DataSocket('A'), DataSocket('B')],
  outputs: [DataSocket('Combined')],
  path: ['Dataset'],
  keywords: []
};

export const DatasetOutputNodeDef: NodeDef = {
  name: 'Dataset Output',
  inputs: [DataSocket('Dataset')],
  outputs: [],
  path: ['Dataset'],
  keywords: []
};
