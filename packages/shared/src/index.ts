import { NodeDef } from './nodes';
import * as DatasetNodes from './nodes/dataset';
import * as EntryNodes from './nodes/entries';
import * as NumberNodes from './nodes/number';
import * as StringNodes from './nodes/string';
import * as ColorsDef from './styles/colors';

export const Colors = ColorsDef;

export const NodesMap = new Map<string, NodeDef>(
  [EntryNodes, StringNodes, NumberNodes, DatasetNodes]
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
export * from './nodes/entries';
