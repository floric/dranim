import * as React from 'react';
import { FormComponentProps } from 'antd/lib/form';

import { NodeInstance, ExplorerEditorProps } from '../ExplorerEditor';
import { OutputSocketInformation } from './Sockets';
import { AllDatasetNodes } from './dataset';
import { AllNumberNodes } from './number';
import { AllStringNodes } from './string';
import {
  ServerNodeDef,
  serverNodeTypes
} from '../../../../../../backend/src/nodes/AllNodes';

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
  title: string;
  renderFormItems?: (props: RenderFormItemsProps) => JSX.Element;
  onClientExecution: (
    inputs: Map<string, OutputSocketInformation>,
    context: EditorContext
  ) => Map<string, OutputSocketInformation>;
}

export type NodeDef = ClientNodeDef & ServerNodeDef;

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
    .map<Array<[string, ClientNodeDef]>>(nodes =>
      nodes.map<[string, ClientNodeDef]>(n => [n.title, n])
    )
    .reduce<Array<[string, ClientNodeDef]>>(
      (list, elem, _, all) => [...list, ...elem],
      []
    )
    .map<[string, NodeDef]>(n => [
      n[0],
      { ...serverNodeTypes.get(n[0])!, ...n[1] }
    ])
    .map(n => {
      console.log(n);
      return n;
    })
    .filter(n => n[1].inputs !== undefined && n[1].inputs !== null)
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const nodeTypesTree = buildTree(Array.from(nodeTypes.values()), []);
