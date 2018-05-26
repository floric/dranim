import * as Konva from 'konva';

import { ExplorerEditorProps, ExplorerEditorState } from '../ExplorerEditor';
import { renderConnection } from './Connections';
import { renderNode } from './Nodes';

export const EXPLORER_CONTAINER = 'explcontainer';

export const updateStage = (
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections, nodes } = server;
  const { openConnection } = state;
  const canvasContainer = document.getElementById(EXPLORER_CONTAINER);
  if (!canvasContainer) {
    throw new Error('Canvas container not found.');
  }

  const canvasWidth = canvasContainer.clientWidth;
  const canvasHeight = canvasContainer.clientHeight;

  const stage = new Konva.Stage({
    container: EXPLORER_CONTAINER,
    width: canvasWidth,
    height: canvasHeight
  });

  const nodesLayer = new Konva.Layer();
  const connsLayer = new Konva.Layer();

  const nodeMap: Map<string, Konva.Group> = new Map();
  const socketsMap: Map<string, Konva.Group> = new Map();

  nodes.forEach(n => {
    const nodeGroup = renderNode(n, server, state, changeState, socketsMap);
    nodesLayer.add(nodeGroup);
    nodeMap.set(n.id, nodeGroup);
  });

  connections.forEach(c => {
    const line = renderConnection(
      c,
      stage,
      connsLayer,
      socketsMap,
      nodeMap,
      changeState
    );
    connsLayer.add(line);
  });

  if (openConnection && openConnection.outputs) {
    openConnection.outputs.forEach(c => {
      const line = renderConnection(
        { from: { name: c.name, nodeId: c.nodeId }, to: null },
        stage,
        connsLayer,
        socketsMap,
        nodeMap,
        changeState
      );
      connsLayer.add(line);
    });
  } else if (openConnection && openConnection.inputs) {
    openConnection.inputs.forEach(c => {
      const line = renderConnection(
        { from: null, to: { name: c.name, nodeId: c.nodeId } },
        stage,
        connsLayer,
        socketsMap,
        nodeMap,
        changeState
      );
      connsLayer.add(line);
    });
  }

  stage.add(connsLayer);
  stage.add(nodesLayer);
};
