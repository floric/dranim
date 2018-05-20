import * as AllDatasetNodes from './dataset';
import * as AllNumberNodes from './number';
import * as AllStringNodes from './string';
import { NumberOutputNode } from './number/OutputNode';
import { DatasetOutputNode } from './dataset/OutputNode';
import { StringOutputNode } from './string/OutputNode';
import { ServerNodeDef, NodesMap, NodeDef } from '@masterthesis/shared';

const allNodes = [AllDatasetNodes, AllNumberNodes, AllStringNodes];

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
