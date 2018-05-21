import * as Konva from 'konva';
import { ExplorerEditorState, ExplorerEditorProps } from '../ExplorerEditor';
import { nodeTypes } from '../nodes/AllNodes';
import {
  SocketType,
  NodeInstance,
  NodeState,
  SocketDef,
  SocketDefs
} from '@masterthesis/shared';
import {
  renderSocketWithUsages,
  onClickSocket,
  getSocketId,
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
  nodeMap: Map<string, Konva.Group>,
  socketsMap: Map<string, Konva.Group>
) => {
  const nodeType = nodeTypes.get(n.type);
  if (!nodeType) {
    throw new Error('Unknown node type');
  }

  const { inputs, outputs, name } = nodeType;
  const minSocketsNr =
    Object.keys(inputs).length > Object.keys(outputs).length
      ? Object.keys(inputs).length
      : Object.keys(outputs).length;
  const height = (minSocketsNr + 1) * SOCKET_DISTANCE + TEXT_HEIGHT;
  const isSelected = state.selectedNode !== null && state.selectedNode === n.id;

  const nodeGroup = new Konva.Group({ draggable: true, x: n.x, y: n.y });
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
    text: name,
    fontStyle: 'bold',
    height: TEXT_HEIGHT,
    width: NODE_WIDTH,
    y: 10
  });

  const inputsGroup = renderSockets(
    inputs,
    n,
    server,
    state,
    SocketType.INPUT,
    socketsMap,
    changeState
  );
  const outputsGroup = renderSockets(
    outputs,
    n,
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

const renderSockets = (
  sockets: SocketDefs<any>,
  n: NodeInstance,
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
      state,
      n.id,
      changeState,
      (nodeId: string) =>
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
    socketsMap.set(getSocketId(type, n.id, socketDef[0]), socket);
  }

  return group;
};
