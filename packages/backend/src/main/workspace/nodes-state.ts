import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeState
} from '@masterthesis/shared';
import { ObjectID } from 'mongodb';

import { isNodeInMetaValid } from '../calculation/validation';
import { getNodeType, tryGetNodeType } from '../nodes/all-nodes';
import { getNodesCollection, tryGetContextNode, tryGetNode } from './nodes';
import { tryGetParentNode } from './nodes-detail';

export const updateState = async (
  nodeId: string,
  reqContext: ApolloContext
) => {
  const state = await calculateNodeState(nodeId, reqContext);

  const nodesCollection = getNodesCollection(reqContext.db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(nodeId) },
    {
      $set: { state }
    }
  );

  const node = await tryGetNode(nodeId, reqContext);
  const type = await tryGetNodeType(node.type);
  if (hasContextFn(type)) {
    const contextOutputNode = await tryGetContextNode(
      node,
      ContextNodeType.OUTPUT,
      reqContext
    );
    await updateState(contextOutputNode.id, reqContext);
  } else if (
    node.type === ContextNodeType.INPUT ||
    node.type === ContextNodeType.OUTPUT
  ) {
    const parent = await tryGetParentNode(node, reqContext);
    await updateState(parent.id, reqContext);
  }

  return true;
};

export const calculateNodeState = async (
  nodeId: string,
  reqContext: ApolloContext
) => {
  const node = await tryGetNode(nodeId, reqContext);

  try {
    const isValid = await isNodeInMetaValid(node, reqContext);
    if (!isValid) {
      return NodeState.INVALID;
    }

    const nodeType = getNodeType(node.type);
    if (nodeType && hasContextFn(nodeType)) {
      const contextOutputNode = await tryGetContextNode(
        node,
        ContextNodeType.OUTPUT,
        reqContext
      );
      return calculateNodeState(contextOutputNode.id, reqContext);
    }

    return NodeState.VALID;
  } catch (err) {
    console.error(err);
    return NodeState.ERROR;
  }
};
