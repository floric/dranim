import { NodeDef } from './nodes';
import {
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  JoinDatasetsNodeDef,
  SelectValuesNodeDef
} from './nodes/dataset';
import { ForEachEntryNodeDef } from './nodes/entry';
import {
  FormatNumberNodeDef,
  MultiplicationNodeDef,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  SumNodeDef
} from './nodes/number';
import { StringInputNodeDef, StringOutputNodeDef } from './nodes/string';

export const NodesMap = new Map<string, NodeDef>(
  [
    {
      DatasetInputNodeDef,
      DatasetOutputNodeDef,
      JoinDatasetsNodeDef,
      SelectValuesNodeDef
    },
    { StringInputNodeDef, StringOutputNodeDef },
    {
      NumberInputNodeDef,
      NumberOutputNodeDef,
      FormatNumberNodeDef,
      MultiplicationNodeDef,
      SumNodeDef
    },
    {
      ForEachEntryNodeDef
    }
  ]
    .map(n => Object.values(n))
    .reduce<Array<NodeDef>>((list, elem, _, all) => [...list, ...elem], [])
    .map<[string, NodeDef]>(n => [n.name, n])
);

export * from './workspace';
export * from './utils';
export * from './nodes';
export * from './sockets';
export * from './filters';
export * from './nodes/dataset';
export * from './nodes/number';
export * from './nodes/string';
export * from './nodes/entry';
