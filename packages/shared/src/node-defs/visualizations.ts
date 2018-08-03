import { NodeDef } from '../nodes';
import { DatasetSocket } from '../sockets';
import { DatasetRef } from './dataset';

export interface VisInputs {
  dataset: DatasetRef;
}

export enum LinearChartType {
  BAR = 'Bar',
  COLUMN = 'Column',
  PIE = 'Pie'
}

export interface LinearChartForm {
  type: LinearChartType;
}

export const LinearChartDef: NodeDef<VisInputs, {}> = {
  name: 'Linear Charts',
  type: 'LinearChart',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {},
  isOutputNode: true,
  keywords: ['bar', 'column', 'pie'],
  path: ['Visualizations']
};

export const SoundChartDef: NodeDef<VisInputs, {}> = {
  name: 'Sound Chart',
  type: 'SoundChart',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {},
  isOutputNode: true,
  keywords: ['str', 'sound'],
  path: ['Visualizations']
};
