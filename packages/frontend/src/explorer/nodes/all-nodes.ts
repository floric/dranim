import {
  FormValues,
  NodeDef,
  NodeInstance,
  NodesMap,
  NodeWithContextFnDef,
  SocketMetas
} from '@masterthesis/shared';
import { FormComponentProps } from 'antd/lib/form';
import { TreeData } from 'antd/lib/tree-select';

import { ExplorerEditorProps } from '../ExplorerEditor';
import * as AllDatasetNodes from './dataset';
import * as AllEntryNodes from './entry';
import * as AllNumberNodes from './number';
import * as AllStringNodes from './string';

export interface EditorProps {
  x?: number;
  y?: number;
  nodeId: string;
}

export interface EditorContext {
  state: ExplorerEditorProps;
  node: NodeInstance;
}

export interface RenderFormItemsProps<NodeInputs, NodeForm>
  extends FormComponentProps,
    EditorContext {
  inputs: SocketMetas<NodeInputs>;
  nodeForm: FormValues<NodeForm>;
  setTempState: (state: any) => void;
  getTempState: () => any;
}

export interface ClientNodeDef<
  NodeInputs = {},
  NodeOutputs = {},
  NodeForm = {}
> {
  name: string;
  renderName?: (
    context: EditorContext,
    nodeForm: FormValues<NodeForm>
  ) => string;
  renderFormItems?: (
    props: RenderFormItemsProps<NodeInputs, NodeForm>
  ) => JSX.Element;
  onClientExecution?: (
    inputs: SocketMetas<NodeInputs>,
    nodeForm: FormValues<NodeForm>,
    context: EditorContext
  ) => SocketMetas<NodeOutputs>;
}

export interface ClientNodeWithContextFnDef<
  NodeInputs = {},
  NodeOutputs = {},
  NodeForm = {},
  ContextInputs = {},
  ContextOutputs = {}
> extends ClientNodeDef<NodeInputs, NodeOutputs, NodeForm> {
  onClientBeforeContextFnExecution: (
    inputs: SocketMetas<NodeInputs>,
    nodeForm: FormValues<NodeForm>,
    context: EditorContext
  ) => SocketMetas<ContextInputs>;
  onClientAfterContextFnExecution: (
    inputs: SocketMetas<ContextOutputs>,
    originalInputs: SocketMetas<NodeInputs>,
    nodeForm: FormValues<NodeForm>,
    context: EditorContext
  ) => SocketMetas<NodeOutputs>;
}

const allNodes = [
  AllDatasetNodes,
  AllNumberNodes,
  AllStringNodes,
  AllEntryNodes
];

const buildTree = (
  elems: Array<ClientNodeDef & (NodeDef | NodeWithContextFnDef)>,
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
    label: e[e.length - 1],
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

export const nodeTypes: Map<
  string,
  ClientNodeDef & (NodeDef | NodeWithContextFnDef)
> = new Map(
  allNodes
    .map<Array<[string, ClientNodeDef]>>(nodes =>
      Object.values(nodes).map<[string, ClientNodeDef]>(n => [n.name, n])
    )
    .reduce<Array<[string, ClientNodeDef]>>((a, b) => [...a, ...b], [])
    .map<[string, (ClientNodeDef & (NodeDef | NodeWithContextFnDef))]>(n => [
      n[0],
      { ...NodesMap.get(n[0]), ...n[1] }
    ])
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const nodeTypesTree = buildTree(Array.from(nodeTypes.values()), []);
