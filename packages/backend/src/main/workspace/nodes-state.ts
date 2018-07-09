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
import { tryGetConnection } from './connections';

export const updateState = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<NodeState> => {
  const state = await calculateState(node, reqContext);
  await setState(node.id, state, reqContext);
  await propagateStateChange(node, reqContext);

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

export const updateStateWithId = async (
  nodeId: string,
  reqContext: ApolloContext
): Promise<NodeState> => {
  const node = await tryGetNode(nodeId, reqContext);
  return await updateState(node, reqContext);
};

const propagateStateChange = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  if (node.type === ContextNodeType.OUTPUT) {
    const parent = await tryGetParentNode(node, reqContext);
    await updateState(parent, reqContext);
  } else if (node.type !== ContextNodeType.INPUT) {
    const type = tryGetNodeType(node.type);
    if (hasContextFn(type)) {
      await updateState(
        await tryGetContextNode(node, ContextNodeType.INPUT, reqContext),
        reqContext
      );
    }
  }

  if (node.type !== ContextNodeType.INPUT) {
    await Promise.all(
      node.outputs.map(async c => {
        const conn = await tryGetConnection(c.connectionId, reqContext);
        await updateStateWithId(conn.to.nodeId, reqContext);
      })
    );
  }
};

const calculateState = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<NodeState> => {
  try {
    if (node.type === ContextNodeType.INPUT) {
      const parent = await tryGetParentNode(node, reqContext);
      return parent.state;
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
