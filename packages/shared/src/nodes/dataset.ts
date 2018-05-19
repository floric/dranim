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
  inputs: [DataSocket('Dataset A'), DataSocket('Dataset B')],
  outputs: [DataSocket('Joined')],
  path: ['Dataset'],
  keywords: []
};

export const SelectValuesNodeDef: NodeDef = {
  name: 'Select Values',
  inputs: [DataSocket('Dataset')],
  outputs: [DataSocket('Dataset')],
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
