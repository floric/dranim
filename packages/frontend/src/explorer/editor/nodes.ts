import {
  Colors,
  ConditionalMetaTypes,
  DataType,
  GQLNodeInstance,
  NodeState,
  parseNodeForm,
  SocketDef,
  SocketDefs,
  SocketState,
  SocketType
} from '@masterthesis/shared';
import * as Konva from 'konva';
import { v4 } from 'uuid';

import {
  ExplorerEditorProps,
  ExplorerEditorState,
  OpenConnection
} from '../ExplorerEditor';
import { nodeTypes } from '../nodes/all-nodes';
import { EditorFunctions } from './editor-stage';
import {
  getSocketId,
  onClickSocket,
  renderSocketWithUsages,
  SOCKET_DISTANCE
} from './sockets';

export const NODE_WIDTH = 180;
const TEXT_HEIGHT = 20;
const STATE_LINE_HEIGHT = 2;

export const renderContextNode = (
  n: GQLNodeInstance,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  editorFunctions: EditorFunctions,
  socketsMap: Map<string, Konva.Group>,
  stage: Konva.Stage
) => {
  const nodeGroup = new Konva.Group({ draggable: true, x: n.x, y: n.y });
  nodeGroup.on('mouseenter', () => {
    stage.container().style.cursor = 'move';
  });
  nodeGroup.on('mouseleave', () => {
    stage.container().style.cursor = 'default';
  });

  const inputs = JSON.parse(n.inputSockets);
  const outputs = JSON.parse(n.outputSockets);

  const height = getHeight(n, inputs, outputs, state.openConnection);

  nodeGroup.on('dragend', ev => {
    server.onNodeUpdate(n.id, ev.target.x(), ev.target.y());
  });

  const bgRect = getBackgroundRect(height);
  const nodeTitle = getHeaderText(false, n.type);
  const [inputsGroup, outputsGroup] = [
    { defs: inputs, type: SocketType.INPUT },
    { defs: outputs, type: SocketType.OUTPUT }
  ].map(p =>
    renderSockets(p.defs, n, server, state, p.type, socketsMap, editorFunctions)
  );
  const stateRect = getStateRect(height, n.progress, n.state);

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
  editorFunctions: EditorFunctions,
  socketsMap: Map<string, Konva.Group>,
  stage: Konva.Stage
) => {
  const nodeType = nodeTypes.get(n.type);
  if (!nodeType) {
    throw new Error('Unknown node type');
  }

  const nodeGroup = new Konva.Group({ draggable: true, x: n.x, y: n.y });
  nodeGroup.on('mouseenter', () => {
    stage.container().style.cursor = 'move';
  });
  nodeGroup.on('mouseleave', () => {
    stage.container().style.cursor = 'default';
  });
  nodeGroup.on('dragend', ev => {
    server.onNodeUpdate(n.id, ev.target.x(), ev.target.y());
  });
  nodeGroup.on('dblclick', () => {
    editorFunctions.enterContext(n.id);
  });
  nodeGroup.on('click', () => {
    editorFunctions.changeState({
      selectedNodeId: n.id
    });
  });

  const { name, renderName } = nodeType;
  const inputs = JSON.parse(n.inputSockets);
  const outputs = JSON.parse(n.outputSockets);

  const height = getHeight(n, inputs, outputs, state.openConnection);
  const isSelected =
    state.selectedNodeId !== null && state.selectedNodeId === n.id;
  const bgRect = getBackgroundRect(height);
  const nodeTitle = getHeaderText(
    isSelected,
    renderName
      ? renderName({ node: n, state: server }, parseNodeForm(n.form))
      : name
  );

  const [inputsGroup, outputsGroup] = [
    { defs: inputs, type: SocketType.INPUT },
    { defs: outputs, type: SocketType.OUTPUT }
  ].map(p =>
    renderSockets(p.defs, n, server, state, p.type, socketsMap, editorFunctions)
  );
  const stateRect = getStateRect(height, n.progress, n.state);

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

const getStateRect = (
  height: number,
  progress: number | null,
  state: NodeState
) =>
  new Konva.Rect({
    width: progress !== null ? progress * NODE_WIDTH : NODE_WIDTH,
    height: STATE_LINE_HEIGHT,
    x: 0,
    y: height - STATE_LINE_HEIGHT,
    fill:
      state === NodeState.VALID
        ? Colors.Success
        : state === NodeState.ERROR
          ? Colors.Error
          : Colors.Warning
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

const getHeight = (
  n: GQLNodeInstance,
  inputs: ConditionalMetaTypes<{}>,
  outputs: ConditionalMetaTypes<{}>,
  openConnection: OpenConnection | null
) => {
  const inputsCount =
    openConnection !== null &&
    n.hasContextFn &&
    openConnection.destinations === null
      ? Object.keys(inputs).length + 1
      : Object.keys(inputs).length;
  const outputsCount = Object.keys(outputs).length;

  const maxSocketsCount =
    inputsCount > outputsCount ? inputsCount : outputsCount;

  return (maxSocketsCount + 1) * SOCKET_DISTANCE + TEXT_HEIGHT;
};

const renderSockets = (
  sockets: SocketDefs<any>,
  node: GQLNodeInstance,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  type: SocketType,
  socketsMap: Map<string, Konva.Group>,
  editorFunctions: EditorFunctions
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
      node.id,
      () =>
        onClickSocket(
          socketDef[1],
          socketDef[0],
          type,
          node.id,
          server,
          state,
          editorFunctions.changeState
        )
    );
    group.add(socket);
    socketsMap.set(getSocketId(type, node.id, socketDef[0]), socket);
  }

  if (
    node.hasContextFn &&
    state.openConnection !== null &&
    state.openConnection.destinations === null &&
    type === SocketType.INPUT
  ) {
    const socketDef: SocketDef = {
      dataType: DataType.ANY,
      displayName: 'Add Variable',
      state: SocketState.VARIABLE
    };
    const varName = v4();
    const addVarSocket = renderSocketWithUsages(
      socketDef,
      varName,
      SocketType.INPUT,
      all.length,
      server,
      node.id,
      () =>
        onClickSocket(
          socketDef,
          varName,
          type,
          node.id,
          server,
          state,
          editorFunctions.changeState
        )
    );
    group.add(addVarSocket);
  }

  return group;
};
