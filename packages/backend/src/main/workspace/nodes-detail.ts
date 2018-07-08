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
import { ObjectID } from 'mongodb';

import { getMetaInputs } from '../calculation/meta-execution';
import { isNodeInMetaValid } from '../calculation/validation';
import { getNodeType, hasNodeType, tryGetNodeType } from '../nodes/all-nodes';
import {
  getContextNode,
  getNode,
  getNodesCollection,
  tryGetContextNode,
  tryGetNode
} from './nodes';

export const getContextInputDefs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<SocketDefs<any> | null> => {
  if (hasNodeType(node.type)) {
    return null;
  }

  const parent = await tryGetParentNode(node, reqContext);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(parent, reqContext);
  return await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    parseNodeForm(parent.form),
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

  const parent = await tryGetParentNode(node, reqContext);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(parent, reqContext);
  const contextInputDefs = await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    parseNodeForm(parent.form),
    reqContext
  );

  const contextInputNode = await tryGetContextNode(
    parent,
    ContextNodeType.INPUT,
    reqContext
  );

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
    return {};
  } else if (node.type === ContextNodeType.OUTPUT) {
    inputDefs = (await getContextOutputDefs(node, reqContext)) || {};
  } else {
    const type = tryGetNodeType(node.type);
    inputDefs = type.inputs;
  }

  return inputDefs;
};

const calculateNodeState = async (
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

  const collection = getNodesCollection(reqContext.db);
  const res = await collection.updateOne(
    { _id: new ObjectID(nodeId) },
    { $set: { [`form.${name}`]: value } }
  );

  if (res.result.ok !== 1) {
    throw new Error('Adding or updating form value failed');
  }

  await updateState(nodeId, reqContext);

  return true;
};

export const addConnection = async (
  socket: SocketInstance,
  type: 'output' | 'input',
  connId: string,
  reqContext: ApolloContext
) => {
  const coll = getNodesCollection(reqContext.db);
  await coll.updateOne(
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
  await updateState(socket.nodeId, reqContext);
};

export const removeConnection = async (
  socket: SocketInstance,
  type: 'output' | 'input',
  connId: string,
  reqContext: ApolloContext
) => {
  const coll = getNodesCollection(reqContext.db);
  await coll.updateOne(
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
  await updateState(socket.nodeId, reqContext);
};

export const setProgress = async (
  nodeId: string,
  value: number | null,
  reqContext: ApolloContext
) => {
  if (value != null && (value < 0 || value > 1)) {
    throw new Error('Invalid progress value');
  }

  const coll = getNodesCollection(reqContext.db);
  await coll.updateOne(
    { _id: new ObjectID(nodeId) },
    {
      $set: { progress: value }
    }
  );

  return true;
};

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
  if (hasContextFn(node.type)) {
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
