import {
  FormValues,
  GQLNodeInstance,
  NodeDef,
  NodesMap,
  SocketMetas
} from '@masterthesis/shared';
import { FormComponentProps } from 'antd/lib/form';
import { TreeNode } from 'antd/lib/tree-select';

import * as BooleanNodes from './boolean';
import * as DatasetNodes from './dataset';
import * as DatetimeNodes from './datetime';
import * as EntriesNodes from './entries';
import * as NumberNodes from './number';
import * as StringNodes from './string';
import * as TimeNodes from './time';
import * as VisNodes from './visualization';

import { ExplorerEditorProps } from '../ExplorerEditor';
import { createRenderOutputFormItems } from './output-utils';

export interface EditorProps {
  x?: number;
  y?: number;
  nodeId: string;
}

export interface EditorContext {
  state: ExplorerEditorProps;
  node: GQLNodeInstance;
}

export interface RenderFormItemsProps<NodeInputs, NodeForm>
  extends FormComponentProps,
    EditorContext {
  inputs: SocketMetas<NodeInputs>;
  nodeForm: FormValues<NodeForm>;
  touchForm: () => void;
  setTempState: (state: any) => void;
  getTempState: () => any;
}

export interface ClientNodeDef<
  NodeInputs = {},
  NodeOutputs = {},
  NodeForm = {}
> {
  type: string;
  renderName?: (
    context: EditorContext,
    nodeForm: FormValues<NodeForm>
  ) => string;
  renderFormItems?: (
    props: RenderFormItemsProps<NodeInputs, NodeForm>
  ) => JSX.Element;
}

const allNodes = [
  DatasetNodes,
  NumberNodes,
  StringNodes,
  BooleanNodes,
  EntriesNodes,
  TimeNodes,
  DatetimeNodes,
  VisNodes
];

const buildTree = (
  elems: Array<ClientNodeDef & NodeDef>,
  curPath: Array<string>
): Array<TreeNode> => {
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
    label: e[e.length - 1],
    value: e.join('-'),
    key: e.join('-'),
    children: [
      ...elems
        .filter(elem => JSON.stringify(elem.path) === JSON.stringify(e))
        .map(elem => ({
          label: elem.name,
          value: elem.type,
          key: elem.type,
          index: `${elem.name}, ${elem.path.join(' ')}, ${elem.keywords.join(
            ' '
          )}`.toLocaleLowerCase(),
          children: []
        })),
      ...buildTree(elems, e)
    ]
  }));
};

const clientNodeMap: Map<string, ClientNodeDef> = new Map(
  allNodes
    .map<Array<[string, ClientNodeDef]>>(nodes =>
      Object.values(nodes).map<[string, ClientNodeDef]>(n => [n.type, n])
    )
    .reduce<Array<[string, ClientNodeDef]>>((a, b) => [...a, ...b], [])
);

export const nodeTypes: Map<string, ClientNodeDef & NodeDef> = new Map(
  Array.from(NodesMap.entries())
    .map<[string, NodeDef]>(n => [n[0], n[1]])
    .map<[string, ClientNodeDef & NodeDef]>(n => [
      n[0],
      {
        ...(clientNodeMap.get(n[0])
          ? {
              renderName: clientNodeMap.get(n[0]).renderName,
              renderFormItems: n[1].isOutputNode
                ? (createRenderOutputFormItems(
                    clientNodeMap.get(n[0]).renderFormItems
                  ) as any)
                : clientNodeMap.get(n[0]).renderFormItems
            }
          : {
              type: n[0],
              renderFormItems: n[1].isOutputNode
                ? (createRenderOutputFormItems() as any)
                : undefined
            }),
        ...n[1]
      }
    ])
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const nodeTypesTree = buildTree(Array.from(nodeTypes.values()), []);
