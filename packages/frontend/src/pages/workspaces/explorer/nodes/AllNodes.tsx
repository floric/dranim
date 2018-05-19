import * as React from 'react';
import { FormComponentProps } from 'antd/lib/form';

import { ExplorerEditorProps } from '../ExplorerEditor';
import { OutputSocketInformation } from './Sockets';
import { AllDatasetNodes } from './dataset';
import { AllNumberNodes } from './number';
import { AllStringNodes } from './string';
import {
  NodeInstance,
  NodeDef,
  NodesMap,
  ServerNodeDef
} from '@masterthesis/shared';
import { TreeData } from 'antd/lib/tree-select';

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

export interface ClientNodeDef {
  name: string;
  renderFormItems?: (props: RenderFormItemsProps) => JSX.Element;
  onClientExecution?: (
    inputs: Map<string, OutputSocketInformation>,
    context: EditorContext
  ) => Map<string, OutputSocketInformation>;
}

const allNodes = [AllDatasetNodes, AllNumberNodes, AllStringNodes];

const buildTree = (
  elems: Array<ClientNodeDef & NodeDef>,
  curPath: Array<string>
): Array<TreeData> => {
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
        .filter(elem => JSON.stringify(elem.path) === JSON.stringify(e))
        .map(elem => ({
          label: elem.name,
          value: elem.name,
          key: elem.name,
          index: `${elem.name}, ${elem.path.join(' ')}, ${elem.keywords.join(
            ' '
          )}`.toLocaleLowerCase(),
          children: []
        })),
      ...buildTree(elems, e)
    ]
  }));
};

export const nodeTypes: Map<string, ClientNodeDef & NodeDef> = new Map(
  allNodes
    .map<Array<[string, ClientNodeDef]>>(nodes =>
      nodes.map<[string, ClientNodeDef]>(n => [n.name, n])
    )
    .reduce<Array<[string, ClientNodeDef]>>((a, b) => [...a, ...b], [])
    .map<[string, (ClientNodeDef & NodeDef) | null]>(n => [
      n[0],
      NodesMap.has(n[0]) ? { ...NodesMap.get(n[0]), ...n[1] } : null
    ])
    .filter(n => n[1] !== null)
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const nodeTypesTree = buildTree(Array.from(nodeTypes.values()), []);
