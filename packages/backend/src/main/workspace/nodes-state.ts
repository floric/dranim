import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  NodeState
} from '@masterthesis/shared';
import { ObjectID } from 'mongodb';

import { isNodeInMetaValid } from '../calculation/validation';
import { getNodeType } from '../nodes/all-nodes';
import { deleteConnection, getAllConnections } from './connections';
import {
  getAllNodes,
  getNodesCollection,
  tryGetContextNode,
  tryGetNode
} from './nodes';
import {
  getContextInputDefs,
  getContextOutputDefs,
  tryGetParentNode
} from './nodes-detail';

export const updateStates = async (wsId: string, reqContext: ApolloContext) => {
  const allConns = await getAllConnections(wsId, reqContext);
  await Promise.all(
    allConns.map(async c => {
      const [inputNode, outputNode] = await Promise.all([
        tryGetNode(c.from.nodeId, reqContext),
        tryGetNode(c.to.nodeId, reqContext)
      ]);
      if (inputNode.type === ContextNodeType.INPUT) {
        const contextInputDefs = await getContextInputDefs(
          inputNode,
          reqContext
        );
        if (contextInputDefs && contextInputDefs[c.from.name] === undefined) {
          await deleteConnection(c.id, reqContext);
        }
      } else if (outputNode.type === ContextNodeType.OUTPUT) {
        const contextOutputDefs = await getContextOutputDefs(
          outputNode,
          reqContext
        );
        if (contextOutputDefs && contextOutputDefs[c.to.name] === undefined) {
          await deleteConnection(c.id, reqContext);
        }
      }
    })
  );

  const allNodes = await getAllNodes(wsId, reqContext);
  await Promise.all(allNodes.map(n => updateState(n, reqContext)));
};

export const updateState = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<NodeState> => {
  const state = await calculateState(node, reqContext);
  await setState(node.id, state, reqContext);

  return state;
};

const setState = async (
  nodeId: string,
  state: NodeState,
  reqContext: ApolloContext
) => {
  const nodesCollection = getNodesCollection(reqContext.db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(nodeId) },
    {
      $set: { state }
    }
  );
};

const calculateState = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<NodeState> => {
  try {
    if (node.type === ContextNodeType.INPUT) {
      const parent = await tryGetParentNode(node, reqContext);
      return await calculateState(parent, reqContext);
    }

    const isValid = await isNodeInMetaValid(node, reqContext);
    if (!isValid) {
      return NodeState.INVALID;
    }

    const nodeType = getNodeType(node.type);
    if (nodeType != null && hasContextFn(nodeType)) {
      const contextOutputNode = await tryGetContextNode(
        node,
        ContextNodeType.OUTPUT,
        reqContext
      );
      return await calculateState(contextOutputNode, reqContext);
    }

    return NodeState.VALID;
  } catch (err) {
    console.error(err);
    return NodeState.ERROR;
  }
};
