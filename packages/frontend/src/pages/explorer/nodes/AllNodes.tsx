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

const buildTree = (elems: Array<NodeOptions>, curPath: Array<string>) => {
  const nextPaths = elems
    .filter(
      e =>
        JSON.stringify(e.path.slice(0, curPath.length)) ===
          JSON.stringify(curPath) && e.path.length === curPath.length + 1
    )
    .map(e => e.path);
  const distinctPaths = nextPaths.filter(
    (elem, i) =>
      nextPaths
        .map(n => JSON.stringify(n))
        .findIndex(a => a === JSON.stringify(elem)) === i
  );

  return distinctPaths.map(e => ({
    label: e.join('-'),
    value: e.join('-'),
    key: e.join('-'),
    children: [
      ...elems
        .filter(
          childE => JSON.stringify(childE.path) === JSON.stringify(curPath)
        )
        .map(childE => ({
          label: childE.title,
          value: childE.title,
          key: childE.title,
          children: []
        })),
      ...buildTree(elems, e)
    ]
  }));
};

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

export const nodeTypesTree = buildTree(Array.from(nodeTypes.values()), []);
