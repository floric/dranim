import {
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  JoinDatasetsNodeDef,
  SelectValuesNodeDef
} from './nodes/dataset';
import { StringInputNodeDef, StringOutputNodeDef } from './nodes/string';
import {
  NumberInputNodeDef,
  NumberOutputNodeDef,
  FormatNumberNodeDef,
  MultiplicationNodeDef,
  SumNodeDef
} from './nodes/number';
import { NodeDef } from './nodes';

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
export * from './nodes/dataset';
export * from './nodes/number';
export * from './nodes/string';
