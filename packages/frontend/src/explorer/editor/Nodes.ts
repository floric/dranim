import {
  ConditionalMetaTypes,
  NodeInstance,
  NodeState,
  parseNodeForm,
  SocketDef,
  SocketDefs,
  SocketType
} from '@masterthesis/shared';
import * as Konva from 'konva';

import { ExplorerEditorProps, ExplorerEditorState } from '../ExplorerEditor';
import { nodeTypes } from '../nodes/AllNodes';
import {
  getSocketId,
  onClickSocket,
  renderSocketWithUsages,
  SOCKET_DISTANCE
} from './Sockets';

export const NODE_WIDTH = 160;
const TEXT_HEIGHT = 20;
const STATE_LINE_HEIGHT = 1;

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
  const isSelected = state.selectedNode !== null && state.selectedNode === n.id;

  nodeGroup.on('dragend', ev => {
    server.onNodeUpdate(n.id, ev.target.x(), ev.target.y());
  });

  nodeGroup.on('click', ev => {
    changeState({
      selectedNode: n.id
    });
  });

  const bgRect = new Konva.Rect({
    width: NODE_WIDTH,
    height,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowBlur: 5,
    fill: '#FFF'
  });

  const nodeTitle = new Konva.Text({
    fill: isSelected ? '#1890ff' : '#000',
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
