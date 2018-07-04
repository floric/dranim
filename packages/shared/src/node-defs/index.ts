import { NodeDef } from '../nodes';

import * as BooleanNodes from './boolean';
import * as DatasetNodes from './dataset';
import * as DatetimeNodes from './datetime';
import * as EntryNodes from './entries';
import * as NumberNodes from './number';
import * as StringNodes from './string';
import * as TimeNodes from './time';
import { VisBarChartDef } from './visualizations';

export * from './dataset';
export * from './number';
export * from './string';
export * from './entries';
export * from './boolean';
export * from './time';
export * from './datetime';
export * from './visualizations';

export const NodesMap = new Map<string, NodeDef>(
  [
    EntryNodes,
    StringNodes,
    NumberNodes,
    DatasetNodes,
    BooleanNodes,
    TimeNodes,
    DatetimeNodes,
    { VisBarChartDef }
  ]
    .map(n => Object.values(n))
    .reduce<Array<NodeDef>>((list, elem) => [...list, ...elem], [])
    .map<[string, NodeDef]>(n => [n.type, n])
);
