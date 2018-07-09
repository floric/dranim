import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  NodeState
} from '@masterthesis/shared';
import { ObjectID } from 'mongodb';

import { isNodeInMetaValid } from '../calculation/validation';
import { getNodeType, tryGetNodeType } from '../nodes/all-nodes';
import { getNodesCollection, tryGetContextNode, tryGetNode } from './nodes';
import { tryGetParentNode } from './nodes-detail';

export const updateState = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  const state = await calculateNodeState(node, reqContext);

  const nodesCollection = getNodesCollection(reqContext.db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(node.id) },
    {
      $set: { state }
    }
  );

  const type = await tryGetNodeType(node.type);
  if (hasContextFn(type)) {
    const contextOutputNode = await tryGetContextNode(
      node,
      ContextNodeType.OUTPUT,
      reqContext
    );
    await updateState(contextOutputNode, reqContext);
  } else if (
    node.type === ContextNodeType.INPUT ||
    node.type === ContextNodeType.OUTPUT
  ) {
    const parent = await tryGetParentNode(node, reqContext);
    await updateState(parent, reqContext);
  }

  return true;
};

export const updateStateWithId = async (
  nodeId: string,
  reqContext: ApolloContext
) => {
  const node = await tryGetNode(nodeId, reqContext);
  await updateState(node, reqContext);
};

export const calculateNodeState = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  try {
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
      return calculateNodeState(contextOutputNode, reqContext);
    }

    return NodeState.VALID;
  } catch (err) {
    console.error(err);
    return NodeState.ERROR;
  }
};
