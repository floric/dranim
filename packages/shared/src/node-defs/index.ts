import { NodeDef } from '../nodes';

import * as BooleanNodes from './boolean';
import * as DatasetNodes from './dataset';
import {
  DatetimeConstructNodeDef,
  DatetimeInputNodeDef,
  DatetimeSplitNodeDef
} from './datetime';
import {
  AggregateEntriesNodeDef,
  CountEntriesNodeDef,
  DistinctEntriesNodeDef,
  EditEntriesNodeDef,
  FilterEntriesNodeDef
} from './entries';
import {
  ComparisonNodeDef,
  FormatNumberNodeDef,
  MultiplicationNodeDef,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  SumNodeDef
} from './number';
import * as StringNodes from './string';
import {
  TimeConstructNodeDef,
  TimeInputNodeDef,
  TimeSplitNodeDef
} from './time';
import { LinearChartDef, SoundChartDef } from './visualizations';

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
    {
      DistinctEntriesNodeDef,
      EditEntriesNodeDef,
      AggregateEntriesNodeDef,
      CountEntriesNodeDef,
      FilterEntriesNodeDef
    },
    StringNodes,
    {
      ComparisonNodeDef,
      FormatNumberNodeDef,
      MultiplicationNodeDef,
      NumberInputNodeDef,
      NumberOutputNodeDef,
      SumNodeDef
    },
    DatasetNodes,
    BooleanNodes,
    { TimeConstructNodeDef, TimeInputNodeDef, TimeSplitNodeDef },
    { DatetimeConstructNodeDef, DatetimeInputNodeDef, DatetimeSplitNodeDef },
    { LinearChartDef, SoundChartDef }
  ]
    .map(n => Object.values(n))
    .reduce<Array<NodeDef>>((list, elem) => [...list, ...elem], [])
    .map<[string, NodeDef]>(n => [n.type, n])
);
