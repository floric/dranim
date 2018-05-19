import * as DatasetNodes from './nodes/dataset';
import * as StringNodes from './nodes/string';
import * as NumberNodes from './nodes/number';
import { NodeDef } from './interfaces';

export const NodesMap = new Map<string, NodeDef>(
  [DatasetNodes, StringNodes, NumberNodes]
    .map(n => Object.values(n))
    .reduce<Array<NodeDef>>((list, elem, _, all) => [...list, ...elem], [])
    .map<[string, NodeDef]>(n => [n.name, n])
);

export * from './interfaces';
export * from './utils';
export * from './nodes/dataset';
export * from './nodes/number';
export * from './nodes/string';
