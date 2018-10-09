import {
  Colors,
  ConditionalMetaTypes,
  ContextNodeType,
  DataType,
  GQLNodeInstance,
  NodeDef,
  NodeState,
  SocketDef,
  SocketDefs,
  SocketState,
  SocketType
} from '@masterthesis/shared';
import { Group, Rect, Stage, Text } from 'konva';
import { v4 } from 'uuid';

import {
  ExplorerEditorProps,
  ExplorerEditorState,
  OpenConnection
} from '../ExplorerEditor';
import { ClientNodeDef, nodeTypes } from '../nodes/all-nodes';
import { EditorFunctions } from './editor-stage';
import {
  getSocketId,
  onClickSocket,
  renderSocketWithUsages,
  SOCKET_DISTANCE
} from './sockets';

export const NODE_WIDTH = 220;
const TEXT_HEIGHT = 20;
const STATE_LINE_HEIGHT = 2;

export const renderNode = (
  n: GQLNodeInstance,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  editorFunctions: EditorFunctions,
  socketsMap: Map<string, Group>,
  stage: Stage
) => {
  const nodeType = nodeTypes.get(n.type);
  const isSelected =
    state.selectedNodeId !== null && state.selectedNodeId === n.id;

  const nodeGroup = new Group({ draggable: true, x: n.x, y: n.y });
  addEventHandlers(nodeGroup, stage, n, server, editorFunctions);

  const inputs = JSON.parse(n.inputSockets);
  const outputs = JSON.parse(n.outputSockets);
  const height = getHeight(n, inputs, outputs, state.openConnection);

  nodeGroup.add(getBackgroundRect(height));
  nodeGroup.add(
    getHeaderText(
      isSelected,
      nodeType
        ? nodeType.name
        : n.type === ContextNodeType.INPUT
          ? 'Context Input'
          : 'Context Output'
    )
  );
  if (n.hasContextFn) {
    nodeGroup.add(getContextFunctionNote());
  }
  if (nodeType && nodeType.renderName) {
    nodeGroup.add(getInformationText(n, nodeType, server));
  }
  [
    { defs: inputs, type: SocketType.INPUT },
    { defs: outputs, type: SocketType.OUTPUT }
  ].forEach(p =>
    nodeGroup.add(
      renderSockets(
        p.defs,
        n,
        server,
        state,
        p.type,
        socketsMap,
        editorFunctions
      )
    )
  );
  nodeGroup.add(getStateRect(height, n.state));

  return nodeGroup;
};

const getInformationText = (
  n: GQLNodeInstance,
  nodeType: NodeDef & ClientNodeDef,
  server: ExplorerEditorProps
) =>
  new Text({
    fill: Colors.GrayMedium,
    align: 'center',
    fontSize: 18,
    text: nodeType.renderName({ node: n, state: server }, n.form),
    y: TEXT_HEIGHT * 1.25,
    width: NODE_WIDTH
  });

const addEventHandlers = (
  nodeGroup: Group,
  stage: Stage,
  n: GQLNodeInstance,
  server: ExplorerEditorProps,
  editorFunctions: EditorFunctions
) =>
  nodeGroup
    .on('mouseenter', () => (stage.container().style.cursor = 'move'))
    .on('mouseleave', () => (stage.container().style.cursor = 'default'))
    .on('dragend', ev =>
      server.onNodeUpdate(n.id, ev.target.x(), ev.target.y())
    )
    .on('dblclick', () => {
      if (n.hasContextFn) {
        editorFunctions.enterContext(n.id);
      }
    })
    .on('click', () => {
      if (
        n.type !== ContextNodeType.INPUT &&
        n.type !== ContextNodeType.OUTPUT
      ) {
        editorFunctions.changeState({
          selectedNodeId: n.id
        });
      }
    });

const getContextFunctionNote = () =>
  new Text({
    fill: Colors.Black,
    align: 'right',
    text: 'f(n)',
    height: TEXT_HEIGHT,
    width: NODE_WIDTH / 2 - 5,
    y: 10,
    x: NODE_WIDTH / 2 - 5
  });

const getStateRect = (height: number, state: NodeState) =>
  new Rect({
    width: NODE_WIDTH,
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
  new Rect({
    width: NODE_WIDTH,
    height,
    shadowColor: Colors.Black,
    shadowOpacity: 0.1,
    shadowBlur: 5,
    fill: Colors.White
  });

const getHeaderText = (isSelected: boolean, text: string) =>
  new Text({
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
  socketsMap: Map<string, Group>,
  editorFunctions: EditorFunctions
) => {
  const group = new Group({
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
