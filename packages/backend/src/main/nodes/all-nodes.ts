import { NodeDef, NodesMap, ServerNodeDef } from '@masterthesis/shared';

import * as BooleanNodes from './boolean';
import * as DatasetNodes from './dataset';
import * as DatetimeNodes from './datetime';
import * as EntryNodes from './entries';
import * as NumberNodes from './number';
import * as StringNodes from './string';
import * as TimeNodes from './time';

export const serverNodeTypes: Map<string, ServerNodeDef & NodeDef> = new Map(
  [
    DatasetNodes,
    NumberNodes,
    StringNodes,
    EntryNodes,
    BooleanNodes,
    TimeNodes,
    DatetimeNodes
  ]
    .map<Array<[string, ServerNodeDef]>>(nodes =>
      Object.values(nodes).map<[string, ServerNodeDef]>(n => [n.type, n])
    )
    .reduce<Array<[string, ServerNodeDef]>>((a, b) => [...a, ...b], [])
    .map<[string, (ServerNodeDef & NodeDef)]>(n => [
      n[0],
      { ...NodesMap.get(n[0])!, ...n[1] }
    ])
);

export const tryGetNodeType = (type: string): NodeDef & ServerNodeDef => {
  if (!serverNodeTypes.has(type)) {
    throw new Error('Unknown node type');
  }

  return serverNodeTypes.get(type)!;
};
