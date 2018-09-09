import { ContextNodeType } from '@masterthesis/shared';
import deepEqual from 'deep-equal';
import * as Konva from 'konva';

import { ExplorerEditorProps, ExplorerEditorState } from '../ExplorerEditor';
import { renderConnection } from './connections';
import { renderContextNode, renderNode } from './nodes';

export const EXPLORER_CONTAINER = 'explcontainer';
export type EditorFunctions = {
  changeState: (newState: Partial<ExplorerEditorState>) => void;
  enterContext: (nodeId: string) => void;
  leaveContext: () => void;
};

export const updateStage = (
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  editorFunctions: EditorFunctions
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
    editorFunctions,
    stage
  );

  const connsLayer = createConnectionsLayer(
    server,
    state,
    stage,
    socketsMap,
    nodeMap,
    editorFunctions
  );

  stage.add(connsLayer);
  stage.add(nodesLayer);
};

const createNodesLayer = (
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  socketsMap: Map<string, Konva.Group>,
  nodeMap: Map<string, Konva.Group>,
  editorFunctions: EditorFunctions,
  stage: Konva.Stage
) => {
  const nodesLayer = new Konva.Layer();

  const { nodes } = server;
  const nodesInContext = nodes.filter(n =>
    deepEqual(n.contextIds, state.contextIds)
  );

  for (const n of nodesInContext) {
    const nodeGroup =
      n.type !== ContextNodeType.INPUT && n.type !== ContextNodeType.OUTPUT
        ? renderNode(n, server, state, editorFunctions, socketsMap, stage)
        : renderContextNode(
            n,
            server,
            state,
            editorFunctions,
            socketsMap,
            stage
          );
    nodesLayer.add(nodeGroup);
    nodeMap.set(n.id, nodeGroup);
  }

  return nodesLayer;
};

const createConnectionsLayer = (
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  stage: Konva.Stage,
  socketsMap: Map<string, Konva.Group>,
  nodeMap: Map<string, Konva.Group>,
  editorFunctions: EditorFunctions
) => {
  const connsLayer = new Konva.Layer();

  const { connections } = server;
  const { openConnection } = state;

  const contextConnections = connections.filter(c =>
    deepEqual(c.contextIds, state.contextIds)
  );

  for (const c of contextConnections) {
    const line = renderConnection(
      c,
      stage,
      connsLayer,
      socketsMap,
      nodeMap,
      editorFunctions
    );
    connsLayer.add(line);
  }

  if (openConnection && openConnection.sources) {
    for (const c of openConnection.sources) {
      const line = renderConnection(
        { from: { name: c.name, nodeId: c.nodeId }, to: null },
        stage,
        connsLayer,
        socketsMap,
        nodeMap,
        editorFunctions
      );
      connsLayer.add(line);
    }
  } else if (openConnection && openConnection.destinations) {
    for (const c of openConnection.destinations) {
      const line = renderConnection(
        { from: null, to: { name: c.name, nodeId: c.nodeId } },
        stage,
        connsLayer,
        socketsMap,
        nodeMap,
        editorFunctions
      );
      connsLayer.add(line);
    }
  }

  return connsLayer;
};
