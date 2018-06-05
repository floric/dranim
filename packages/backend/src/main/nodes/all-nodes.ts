import { NodeDef, NodesMap, ServerNodeDef } from '@masterthesis/shared';

import * as BooleanNodes from './boolean';
import * as DatasetNodes from './dataset';
import * as EntryNodes from './entries';
import * as NumberNodes from './number';
import * as StringNodes from './string';

const allNodes = [
  DatasetNodes,
  NumberNodes,
  StringNodes,
  EntryNodes,
  BooleanNodes
];

export const serverNodeTypes: Map<string, ServerNodeDef & NodeDef> = new Map(
  allNodes
    .map<Array<[string, ServerNodeDef]>>(nodes =>
      Object.values(nodes).map<[string, ServerNodeDef]>(n => [n.name, n])
    )
    .reduce<Array<[string, ServerNodeDef]>>((a, b) => [...a, ...b], [])
    .map<[string, (ServerNodeDef & NodeDef)]>(n => [
      n[0],
      { ...NodesMap.get(n[0])!, ...n[1] }
    ])
);
