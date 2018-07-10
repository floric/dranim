import { ContextNodeType } from '@masterthesis/shared';
import * as Konva from 'konva';

import { ExplorerEditorProps, ExplorerEditorState } from '../ExplorerEditor';
import { renderConnection } from './connections';
import { renderContextNode, renderNode } from './nodes';

export const EXPLORER_CONTAINER = 'explcontainer';

export const updateStage = (
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const canvasContainer = document.getElementById(EXPLORER_CONTAINER);
  if (!canvasContainer) {
    throw new Error('Canvas container not found.');
  }

  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;

  const stage = new Konva.Stage({
    container: EXPLORER_CONTAINER,
    width,
    height
  });

  const nodeMap: Map<string, Konva.Group> = new Map();
  const socketsMap: Map<string, Konva.Group> = new Map();

  const nodesLayer = createNodesLayer(
    server,
    state,
    socketsMap,
    nodeMap,
    changeState,
    stage
  );

  const connsLayer = createConnectionsLayer(
    server,
    state,
    stage,
    socketsMap,
    nodeMap,
    changeState
  );

  stage.add(connsLayer);
  stage.add(nodesLayer);
};

const createNodesLayer = (
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  socketsMap: Map<string, Konva.Group>,
  nodeMap: Map<string, Konva.Group>,
  changeState: (newState: Partial<ExplorerEditorState>) => void,
  stage: Konva.Stage
) => {
  const nodesLayer = new Konva.Layer();

  const { nodes } = server;

  nodes
    .filter(
      n =>
        JSON.stringify(n.contextIds) === JSON.stringify(state.contextIds) &&
        n.type !== ContextNodeType.INPUT &&
        n.type !== ContextNodeType.OUTPUT
    )
    .forEach(n => {
      const nodeGroup = renderNode(
        n,
        server,
        state,
        changeState,
        socketsMap,
        stage
      );
      nodesLayer.add(nodeGroup);
      nodeMap.set(n.id, nodeGroup);
    });

  nodes
    .filter(
      n =>
        JSON.stringify(n.contextIds) === JSON.stringify(state.contextIds) &&
        (n.type === ContextNodeType.INPUT || n.type === ContextNodeType.OUTPUT)
    )
    .forEach(n => {
      const nodeGroup = renderContextNode(
        n,
        server,
        state,
        changeState,
        socketsMap,
        stage
      );
      nodesLayer.add(nodeGroup);
      nodeMap.set(n.id, nodeGroup);
    });

  return nodesLayer;
};

const createConnectionsLayer = (
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  stage: Konva.Stage,
  socketsMap: Map<string, Konva.Group>,
  nodeMap: Map<string, Konva.Group>,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const connsLayer = new Konva.Layer();

  const { connections } = server;
  const { openConnection } = state;

  connections
    .filter(
      c => JSON.stringify(c.contextIds) === JSON.stringify(state.contextIds)
    )
    .forEach(c => {
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

  if (openConnection && openConnection.sources) {
    openConnection.sources.forEach(c => {
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
  } else if (openConnection && openConnection.destinations) {
    openConnection.destinations.forEach(c => {
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

  return connsLayer;
};
