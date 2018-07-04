import { NodeDef } from '../nodes';
import { DatasetSocket } from '../sockets';
import { DatasetRef } from './dataset';

export interface VisInputs {
  dataset: DatasetRef;
}

export enum VisBarChartType {
  BAR = 'Bar',
  COLUMN = 'Column',
  PIE = 'Pie'
}

export interface VisBarChartForm {
  type: VisBarChartType;
}

export const VisBarChartDef: NodeDef<VisInputs, {}> = {
  name: 'Linear Charts',
  type: 'BarChart',
  inputs: {
    dataset: DatasetSocket('Dataset')
  },
  outputs: {},
  isOutputNode: true,
  keywords: ['Vis', 'barchart', 'columnchart', 'piechart'],
  path: ['Vis']
};
