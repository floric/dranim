import { NodeDef, NodesMap, ServerNodeDef } from '@masterthesis/shared';

import * as AllDatasetNodes from './dataset';
import * as AllEntryNodes from './entry';
import * as AllNumberNodes from './number';
import * as AllStringNodes from './string';

const allNodes = [
  AllDatasetNodes,
  AllNumberNodes,
  AllStringNodes,
  AllEntryNodes
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

export const absentMeta = {
  content: {},
  isPresent: false
};

export const presentMeta = {
  content: {},
  isPresent: true
};
