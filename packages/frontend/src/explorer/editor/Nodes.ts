import * as Konva from 'konva';
import { ExplorerEditorState, ExplorerEditorProps } from '../ExplorerEditor';
import { nodeTypes } from '../nodes/AllNodes';
import {
  SocketType,
  NodeInstance,
  NodeState,
  SocketDef
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

  const inputsGroup = new Konva.Group({
    x: 0,
    y: SOCKET_DISTANCE + TEXT_HEIGHT
  });
  const allInputs: Array<[string, SocketDef]> = Array.from(
    Object.entries(inputs)
  );
  for (let i = 0; i < allInputs.length; ++i) {
    const input = allInputs[i];
    const socket = renderSocketWithUsages(
      input[1],
      input[0],
      SocketType.INPUT,
      i,
      server,
      state,
      n.id,
      changeState,
      (nodeId: string) =>
        onClickSocket(
          input[1],
          input[0],
          SocketType.INPUT,
          nodeId,
          server,
          state,
          changeState
        )
    );
    inputsGroup.add(socket);
    socketsMap.set(getSocketId(SocketType.INPUT, n.id, input[0]), socket);
  }

  const outputsGroup = new Konva.Group({
    x: NODE_WIDTH,
    y: SOCKET_DISTANCE + TEXT_HEIGHT
  });
  const allOutputs: Array<[string, SocketDef]> = Array.from(
    Object.entries(outputs)
  );
  for (let i = 0; i < allOutputs.length; ++i) {
    const output = allOutputs[i];
    const socket = renderSocketWithUsages(
      output[1],
      output[0],
      SocketType.OUTPUT,
      i,
      server,
      state,
      n.id,
      changeState,
      (nodeId: string) =>
        onClickSocket(
          output[1],
          output[0],
          SocketType.OUTPUT,
          nodeId,
          server,
          state,
          changeState
        )
    );
    outputsGroup.add(socket);
    socketsMap.set(getSocketId(SocketType.OUTPUT, n.id, output[0]), socket);
  }

  const stateRect = new Konva.Rect({
    width: NODE_WIDTH,
    height: STATE_LINE_HEIGHT,
    x: 0,
    y: height - STATE_LINE_HEIGHT,
    fill: n.state === NodeState.VALID ? 'green' : 'red'
  });

  nodeGroup.add(bgRect);
  nodeGroup.add(nodeTitle);
  nodeGroup.add(inputsGroup);
  nodeGroup.add(outputsGroup);
  nodeGroup.add(stateRect);

  return nodeGroup;
};
