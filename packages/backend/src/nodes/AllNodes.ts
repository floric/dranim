import { AllDatasetNodes } from './dataset';
import { AllNumberNodes } from './number';
import { AllStringNodes } from './string';
import { NumberOutputNode } from './number/OutputNode';
import { DatasetOutputNode } from './dataset/OutputNode';
import { StringOutputNode } from './string/OutputNode';
import { ServerNodeDef, NodesMap, NodeDef } from '@masterthesis/shared';

const allNodes = [AllDatasetNodes, AllNumberNodes, AllStringNodes];
export const serverNodeTypes: Map<string, ServerNodeDef & NodeDef> = new Map(
  allNodes
    .map<Array<[string, ServerNodeDef]>>(nodes =>
      nodes.map<[string, ServerNodeDef]>(n => [n.name, n])
    )
    .reduce<Array<[string, ServerNodeDef]>>((a, b) => [...a, ...b], [])
    .map<[string, (ServerNodeDef & NodeDef) | null]>(n => [
      n[0],
      NodesMap.has(n[0]) ? { ...NodesMap.get(n[0]), ...n[1] } : null
    ])
    .filter(n => n[1] !== null)
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const outputNodes = [
  StringOutputNode,
  NumberOutputNode,
  DatasetOutputNode
].map(n => n.name);
