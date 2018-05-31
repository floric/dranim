import { NodeDef, NodesMap, ServerNodeDef } from '@masterthesis/shared';

import * as AllDatasetNodes from './dataset';
import { DatasetOutputNode } from './dataset/OutputNode';
import * as AllEntryNodes from './entry';
import * as AllNumberNodes from './number';
import { NumberOutputNode } from './number/OutputNode';
import * as AllStringNodes from './string';
import { StringOutputNode } from './string/OutputNode';

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
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const outputNodes = [
  StringOutputNode,
  NumberOutputNode,
  DatasetOutputNode
].map(n => n.name);
