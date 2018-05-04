import * as Konva from 'konva';

import { ExplorerEditorState, ExplorerEditorProps } from '../ExplorerEditor';
import { renderConnection } from './Connections';
import { renderNode } from './Nodes';

export const EXPLORER_CONTAINER = 'explcontainer';

export const updateStage = (
  canvasId: string,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const { connections, nodes } = server;
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
    const nodeGroup = renderNode(
      n,
      server,
      state,
      changeState,
      nodeMap,
      socketsMap
    );
    nodesLayer.add(nodeGroup);
    nodeMap.set(n.id, nodeGroup);
  });

  for (const c of connections) {
    const line = renderConnection(
      c,
      server,
      state,
      stage,
      connsLayer,
      socketsMap,
      nodeMap,
      changeState
    );
    connsLayer.add(line);
  }

  stage.add(connsLayer);
  stage.add(nodesLayer);
};
