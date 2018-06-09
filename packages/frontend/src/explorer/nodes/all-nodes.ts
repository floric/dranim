import {
  FormValues,
  GQLNodeInstance,
  NodeDef,
  NodesMap,
  SocketMetas
} from '@masterthesis/shared';
import { FormComponentProps } from 'antd/lib/form';
import { TreeData } from 'antd/lib/tree-select';

import { ExplorerEditorProps } from '../ExplorerEditor';
import * as BooleanNodes from './boolean';
import * as DatasetNodes from './dataset';
import * as NumberNodes from './number';
import * as StringNodes from './string';

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
}

const allNodes = [DatasetNodes, NumberNodes, StringNodes, BooleanNodes];

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

const clientNodeMap: Map<string, ClientNodeDef> = new Map(
  allNodes
    .map<Array<[string, ClientNodeDef]>>(nodes =>
      Object.values(nodes).map<[string, ClientNodeDef]>(n => [n.name, n])
    )
    .reduce<Array<[string, ClientNodeDef]>>((a, b) => [...a, ...b], [])
);

export const nodeTypes: Map<string, ClientNodeDef & NodeDef> = new Map(
  Array.from(NodesMap.entries())
    .map<[string, NodeDef]>(n => [n[0], n[1]])
    .map<[string, ClientNodeDef & NodeDef]>(n => [
      n[0],
      { ...(clientNodeMap.get(n[0]) || {}), ...n[1] }
    ])
    .sort((a, b) => a[0].localeCompare(b[0]))
);

export const nodeTypesTree = buildTree(Array.from(nodeTypes.values()), []);
