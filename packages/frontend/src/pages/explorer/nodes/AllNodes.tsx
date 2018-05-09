import * as React from 'react';
import { SFC } from 'react';
import { FormComponentProps } from 'antd/lib/form';

import { NodeInstance, ExplorerEditorProps } from '../ExplorerEditor';
import { Socket, OutputSocketInformation } from './Sockets';
import { AllDatasetNodes } from './dataset';
import { AllNumberNodes } from './number';
import { AllStringNodes } from './string';

export interface EditorProps {
  x?: number;
  y?: number;
  nodeId: string;
}

export interface EditorContext {
  state: ExplorerEditorProps;
  node: NodeInstance;
}

export interface RenderFormItemsProps
  extends FormComponentProps,
    EditorContext {
  inputs: Map<string, OutputSocketInformation>;
}

export interface NodeDef {
  title: string;
  inputs: Array<Socket>;
  outputs: Array<Socket>;
  path: Array<string>;
  keywords: Array<string>;
  renderFormItems?: SFC<RenderFormItemsProps>;
  onClientExecution: (
    inputs: Map<string, OutputSocketInformation>,
    context: EditorContext
  ) => Map<string, OutputSocketInformation>;
}

const allNodes = [AllDatasetNodes, AllNumberNodes, AllStringNodes];

const buildTree = (elems: Array<NodeDef>, curPath: Array<string>) => {
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
    label: <strong>{e[e.length - 1]}</strong>,
    value: e.join('-'),
    key: e.join('-'),
    selectable: false,
    children: [
      ...elems
        .filter(childE => JSON.stringify(childE.path) === JSON.stringify(e))
        .map(childE => ({
          label: childE.title,
          value: childE.title,
          key: childE.title,
          index: `${childE.title}, ${childE.path.join(
            ' '
          )}, ${childE.keywords.join(' ')}`.toLocaleLowerCase(),
          children: []
        })),
      ...buildTree(elems, e)
    ]
  }));
};

export const nodeTypes: Map<string, NodeDef> = new Map(
  allNodes
    .map<Array<[string, NodeDef]>>(nodes =>
      nodes.map<[string, NodeDef]>(n => [n.title, n])
    )
    .reduce<Array<[string, NodeDef]>>(
      (list, elem, _, all) => [...list, ...elem],
      []
    )
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const nodeTypesTree = buildTree(Array.from(nodeTypes.values()), []);
