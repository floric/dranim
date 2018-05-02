import { AllBasicNodes, NodeOptions } from './BasicNodes';
import { AllDatasetNodes } from './DatasetNodes';
import { AllStringNodes } from './StringNodes';
import { AllNumberNodes } from './NumberNodes';

const allNodes = [
  AllBasicNodes,
  AllDatasetNodes,
  AllNumberNodes,
  AllStringNodes
];

export const nodeTypes: Map<string, NodeOptions> = new Map(
  allNodes
    .map<Array<[string, NodeOptions]>>(nodes =>
      nodes.map<[string, NodeOptions]>(n => [n.title, n])
    )
    .reduce<Array<[string, NodeOptions]>>(
      (list, elem, _, all) => [...list, ...elem],
      []
    )
    .sort((a, b) => a['0'].localeCompare(b['0']))
);
