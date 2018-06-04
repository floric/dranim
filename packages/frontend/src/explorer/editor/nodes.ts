import {
  Colors,
  ConditionalMetaTypes,
  DatasetMeta,
  NodeInstance,
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

export const renderNode = (
  n: NodeInstance,
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

  const bgRect = new Konva.Rect({
    width: NODE_WIDTH,
    height,
    shadowColor: Colors.Black,
    shadowOpacity: 0.1,
    shadowBlur: 5,
    fill: Colors.White
  });

  const nodeTitle = new Konva.Text({
    fill: isSelected ? Colors.Selection : Colors.Black,
    align: 'center',
    text: renderName
      ? renderName({ node: n, state: server }, parseNodeForm(n))
      : name,
    fontStyle: 'bold',
    height: TEXT_HEIGHT,
    width: NODE_WIDTH,
    y: 10
  });

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

  const stateRect = new Konva.Rect({
    width: NODE_WIDTH,
    height: STATE_LINE_HEIGHT,
    x: 0,
    y: height - STATE_LINE_HEIGHT,
    fill:
      n.state === NodeState.VALID
        ? 'green'
        : n.state === NodeState.ERROR
          ? 'red'
          : 'orange'
  });

  nodeGroup.add(bgRect);
  nodeGroup.add(nodeTitle);

  // TODO Client verification of context functions
  /*if (hasContextFn(nodeType)) {
    const fnInfo = new Konva.Text({
      fill: Colors.Black,
      align: 'right',
      text: 'f(n)',
      height: TEXT_HEIGHT,
      width: NODE_WIDTH / 2 - 5,
      y: 10,
      x: NODE_WIDTH / 2 - 5
    });

    nodeGroup.add(fnInfo);
  }*/

  nodeGroup.add(inputsGroup);
  nodeGroup.add(outputsGroup);
  nodeGroup.add(stateRect);

  return nodeGroup;
};

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
