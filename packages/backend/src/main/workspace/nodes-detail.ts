import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  NodeState,
  parseNodeForm,
  SocketDef,
  SocketDefs,
  SocketInstance
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import { getMetaInputs } from '../calculation/meta-execution';
import { isNodeInMetaValid } from '../calculation/validation';
import { hasNodeType, tryGetNodeType } from '../nodes/all-nodes';
import {
  getContextNode,
  getNode,
  getNodesCollection,
  tryGetNode
} from './nodes';

export const getContextInputDefs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<SocketDefs<any> | null> => {
  if (hasNodeType(node.type)) {
    return null;
  }

  // will only be accessed by context io nodes
  const parent = await tryGetParentNode(node, reqContext);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(parent, reqContext);
  return await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    reqContext
  );
};

export const getContextOutputDefs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<(SocketDefs<any> & { [name: string]: SocketDef }) | null> => {
  if (hasNodeType(node.type)) {
    return null;
  }

  // will only be accessed by context io nodes
  const parent = await tryGetParentNode(node, reqContext);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(parent, reqContext);
  const contextInputDefs = await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    reqContext
  );

  const contextInputNode = await getContextNode(
    parent,
    ContextNodeType.INPUT,
    reqContext
  );
  if (!contextInputNode) {
    throw new Error('Context input node unknown');
  }

  const contextInputs = await getMetaInputs(contextInputNode, reqContext);

  return await parentType.transformContextInputDefsToContextOutputDefs(
    parentType.inputs,
    parentInputs,
    contextInputDefs,
    contextInputs,
    parseNodeForm(parent.form),
    reqContext
  );
};

export const tryGetParentNode = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  if (node.contextIds.length === 0) {
    throw new Error('Node doesnt have context');
  }

  const parentNodeId = node.contextIds[node.contextIds.length - 1];
  const parent = await getNode(parentNodeId, reqContext);
  if (parent === null) {
    throw new Error('Parent node missing');
  }

  return parent;
};

export const getInputDefs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<SocketDefs<any>> => {
  let inputDefs: SocketDefs<any> = {};
  if (node.type === ContextNodeType.INPUT) {
    const parent = await tryGetParentNode(node, reqContext);
    const parentType = tryGetNodeType(parent.type);
    if (hasContextFn(parentType)) {
      return parentType.transformInputDefsToContextInputDefs(
        parentType.inputs,
        await getMetaInputs(parent, reqContext),
        reqContext
      );
    }
  } else if (node.type === ContextNodeType.OUTPUT) {
    inputDefs = (await getContextOutputDefs(node, reqContext)) || {};
  } else {
    const type = tryGetNodeType(node.type);
    inputDefs = type.inputs;
  }

  return inputDefs;
};

export const getNodeState = async (
  node: NodeInstance,
  reqContext: ApolloContext
) => {
  if (
    node.type === ContextNodeType.INPUT ||
    node.type === ContextNodeType.OUTPUT
  ) {
    return await getNodeState(
      await tryGetParentNode(node, reqContext),
      reqContext
    );
  }

  try {
    const isValid = await isNodeInMetaValid(node, reqContext);
    if (!isValid) {
      return NodeState.INVALID;
    }

    return NodeState.VALID;
  } catch (err) {
    return NodeState.ERROR;
  }
};

export const addOrUpdateFormValue = async (
  nodeId: string,
  name: string,
  value: string,
  reqContext: ApolloContext
) => {
  if (name.length === 0) {
    throw new Error('No form value name specified');
  }

  await tryGetNode(nodeId, reqContext);
  const nodeObjId = new ObjectID(nodeId);

  const collection = getNodesCollection(reqContext.db);
  const res = await collection.updateOne(
    { _id: nodeObjId },
    { $set: { [`form.${name}`]: value } }
  );

  if (res.result.ok !== 1) {
    throw new Error('Adding or updating form value failed');
  }

  return true;
};

export const addConnection = async (
  socket: SocketInstance,
  type: 'output' | 'input',
  connId: string,
  reqContext: ApolloContext
) => {
  const nodesCollection = getNodesCollection(reqContext.db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(socket.nodeId) },
    {
      $push: {
        [type === 'input' ? 'inputs' : 'outputs']: {
          name: socket.name,
          connectionId: connId
        }
      }
    }
  );
};

export const removeConnection = async (
  socket: SocketInstance,
  type: 'output' | 'input',
  connId: string,
  reqContext: ApolloContext
) => {
  const nodesCollection = getNodesCollection(reqContext.db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(socket.nodeId) },
    {
      $pull: {
        [type === 'input' ? 'inputs' : 'outputs']: {
          name: socket.name,
          connectionId: connId
        }
      }
    }
  );
};

export const setProgress = async (
  nodeId: string,
  value: number | null,
  reqContext: ApolloContext
) => {
  if (value != null && (value < 0 || value > 1)) {
    throw new Error('Invalid progress value');
  }

  const nodesCollection = getNodesCollection(reqContext.db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(nodeId) },
    {
      $set: { progress: value }
    }
  );

  return true;
};
