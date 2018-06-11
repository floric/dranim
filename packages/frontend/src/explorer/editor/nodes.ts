import {
  Colors,
  ConditionalMetaTypes,
  ContextNodeType,
  DatasetMeta,
  GQLNodeInstance,
  NodeState,
  parseNodeForm,
  SocketDef,
  SocketDefs,
  SocketMetaDef,
  SocketType
} from '@masterthesis/shared';
import * as Konva from 'konva';

import { ExplorerEditorProps, ExplorerEditorState } from '../ExplorerEditor';
import { nodeTypes } from '../nodes/all-nodes';
import {
  getSocketId,
  onClickSocket,
  renderSocketWithUsages,
  SOCKET_DISTANCE
} from './sockets';

export const NODE_WIDTH = 180;
const TEXT_HEIGHT = 20;
const STATE_LINE_HEIGHT = 1;

export const isEntryMeta = (
  n:
    | { [x: string]: SocketMetaDef<{}> }
    | { [x: string]: SocketMetaDef<DatasetMeta> }
): n is { [x: string]: SocketMetaDef<DatasetMeta> } => {
  const keys = Object.keys(n as { [x: string]: SocketMetaDef<DatasetMeta> });
  return (
    keys.length >= 1 &&
    (n as { [x: string]: SocketMetaDef<DatasetMeta> })[keys[0]].content
      .schema !== undefined
  );
};

export const renderContextNode = (
  n: GQLNodeInstance,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void,
  socketsMap: Map<string, Konva.Group>
) => {
  const nodeGroup = new Konva.Group({ draggable: true, x: n.x, y: n.y });

  const inputs =
    n.type === ContextNodeType.INPUT ? {} : JSON.parse(n.contextOutputDefs);
  const outputs =
    n.type === ContextNodeType.OUTPUT ? {} : JSON.parse(n.contextInputDefs);

  const height = getNodeHeight(inputs, outputs);

  nodeGroup.on('dragend', ev => {
    server.onNodeUpdate(n.id, ev.target.x(), ev.target.y());
  });

  const bgRect = getBackgroundRect(height);
  const nodeTitle = getHeaderText(false, n.type);
  const inputsGroup = renderSockets(
    inputs,
    n.id,
    server,
    state,
    SocketType.INPUT,
    socketsMap,
    changeState
  );
  const outputsGroup = renderSockets(
    outputs,
    n.id,
    server,
    state,
    SocketType.OUTPUT,
    socketsMap,
    changeState
  );
  const stateRect = getStateRect(height, n.state);

  nodeGroup.add(bgRect);
  nodeGroup.add(nodeTitle);
  nodeGroup.add(inputsGroup);
  nodeGroup.add(outputsGroup);
  nodeGroup.add(stateRect);

  return nodeGroup;
};

export const renderNode = (
  n: GQLNodeInstance,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void,
  socketsMap: Map<string, Konva.Group>
) => {
  const nodeType = nodeTypes.get(n.type);
  if (!nodeType) {
    throw new Error('Unknown node type');
  }

  const nodeGroup = new Konva.Group({ draggable: true, x: n.x, y: n.y });

  const { inputs, outputs, name, renderName } = nodeType;
  const height = getNodeHeight(inputs, outputs);
  const isSelected =
    state.selectedNodeId !== null && state.selectedNodeId === n.id;

  nodeGroup.on('dragend', ev => {
    server.onNodeUpdate(n.id, ev.target.x(), ev.target.y());
  });

  nodeGroup.on('click', ev => {
    changeState({
      selectedNodeId: n.id
    });
  });

  const bgRect = getBackgroundRect(height);
  const nodeTitle = getHeaderText(
    isSelected,
    renderName
      ? renderName({ node: n, state: server }, parseNodeForm(n.form))
      : name
  );
  const inputsGroup = renderSockets(
    inputs,
    n.id,
    server,
    state,
    SocketType.INPUT,
    socketsMap,
    changeState
  );
  const outputsGroup = renderSockets(
    outputs,
    n.id,
    server,
    state,
    SocketType.OUTPUT,
    socketsMap,
    changeState
  );
  const stateRect = getStateRect(height, n.state);
  nodeGroup.add(bgRect);
  nodeGroup.add(nodeTitle);

  if (n.hasContextFn) {
    nodeGroup.add(getContextFunctionNote());
  }

  nodeGroup.add(inputsGroup);
  nodeGroup.add(outputsGroup);
  nodeGroup.add(stateRect);

  return nodeGroup;
};

const getContextFunctionNote = () =>
  new Konva.Text({
    fill: Colors.Black,
    align: 'right',
    text: 'f(n)',
    height: TEXT_HEIGHT,
    width: NODE_WIDTH / 2 - 5,
    y: 10,
    x: NODE_WIDTH / 2 - 5
  });

const getStateRect = (height: number, state: NodeState) =>
  new Konva.Rect({
    width: NODE_WIDTH,
    height: STATE_LINE_HEIGHT,
    x: 0,
    y: height - STATE_LINE_HEIGHT,
    fill:
      state === NodeState.VALID
        ? 'green'
        : state === NodeState.ERROR
          ? 'red'
          : 'orange'
  });

const getBackgroundRect = (height: number) =>
  new Konva.Rect({
    width: NODE_WIDTH,
    height,
    shadowColor: Colors.Black,
    shadowOpacity: 0.1,
    shadowBlur: 5,
    fill: Colors.White
  });

const getHeaderText = (isSelected: boolean, text: string) =>
  new Konva.Text({
    fill: isSelected ? Colors.Selection : Colors.Black,
    align: 'center',
    text,
    fontStyle: 'bold',
    height: TEXT_HEIGHT,
    width: NODE_WIDTH,
    y: 10
  });

const getNodeHeight = (
  inputs: ConditionalMetaTypes<{}>,
  outputs: ConditionalMetaTypes<{}>
) => {
  const inputsCount = Object.keys(inputs).length;
  const outputsCount = Object.keys(outputs).length;

  const maxSocketsCount =
    inputsCount > outputsCount ? inputsCount : outputsCount;

  return (maxSocketsCount + 1) * SOCKET_DISTANCE + TEXT_HEIGHT;
};

const renderSockets = (
  sockets: SocketDefs<any>,
  nodeId: string,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  type: SocketType,
  socketsMap: Map<string, Konva.Group>,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const group = new Konva.Group({
    x: type === SocketType.INPUT ? 0 : NODE_WIDTH,
    y: SOCKET_DISTANCE + TEXT_HEIGHT
  });

  const all: Array<[string, SocketDef]> = Array.from(Object.entries(sockets));
  for (let i = 0; i < all.length; ++i) {
    const socketDef = all[i];
    const socket = renderSocketWithUsages(
      socketDef[1],
      socketDef[0],
      type,
      i,
      server,
      nodeId,
      () =>
        onClickSocket(
          socketDef[1],
          socketDef[0],
          type,
          nodeId,
          server,
          state,
          changeState
        )
    );
    group.add(socket);
    socketsMap.set(getSocketId(type, nodeId, socketDef[0]), socket);
  }

  return group;
};
