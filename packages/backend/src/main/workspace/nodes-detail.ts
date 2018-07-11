import {
  ApolloContext,
  ContextNodeType,
  hasContextFn,
  NodeDef,
  NodeInstance,
  parseNodeForm,
  ServerNodeDef,
  SocketDef,
  SocketDefs,
  SocketInstance,
  SocketState
} from '@masterthesis/shared';
import { ObjectID } from 'mongodb';

import { Log } from '../../logging';
import { getMetaInputs } from '../calculation/meta-execution';
import { getNodeType, hasNodeType, tryGetNodeType } from '../nodes/all-nodes';
import {
  getNode,
  getNodesCollection,
  tryGetContextNode,
  tryGetNode
} from './nodes';
import { updateStates } from './nodes-state';

export const getContextInputDefs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<SocketDefs<any>> => {
  if (hasNodeType(node.type)) {
    return {};
  }

  const parent = await tryGetParentNode(node, reqContext);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return {};
  }

  const parentInputs = await getMetaInputs(parent, reqContext);
  const parentDefs = await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    parseNodeForm(parent.form),
    reqContext
  );
  const variableDefs: SocketDefs<{}> = {};
  Object.entries(await getInputDefs(parent, reqContext))
    .filter(n => n[1].state === SocketState.VARIABLE)
    .forEach(n => (variableDefs[n[0]] = n[1]));
  return { ...parentDefs, ...variableDefs };
};

export const getContextOutputDefs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<SocketDefs<any> & { [name: string]: SocketDef }> => {
  if (hasNodeType(node.type)) {
    return {};
  }

  const parent = await tryGetParentNode(node, reqContext);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return {};
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
    inputDefs = hasContextFn(type)
      ? { ...type.inputs, ...node.variables }
      : type.inputs;
  }

  return inputDefs;
};

export const getOutputDefs = async (
  node: NodeInstance,
  reqContext: ApolloContext
): Promise<SocketDefs<any>> => {
  let inputDefs: SocketDefs<any> = {};
  if (node.type === ContextNodeType.OUTPUT) {
    return {};
  } else if (node.type === ContextNodeType.INPUT) {
    inputDefs = (await getContextInputDefs(node, reqContext)) || {};
  } else {
    const type = tryGetNodeType(node.type);
    inputDefs = type.outputs;
  }

  return inputDefs;
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

  const node = await tryGetNode(nodeId, reqContext);
  const collection = getNodesCollection(reqContext.db);
  const res = await collection.updateOne(
    { _id: new ObjectID(nodeId) },
    { $set: { [`form.${name}`]: value } }
  );

  if (res.result.ok !== 1) {
    throw new Error('Adding or updating form value failed');
  }

  await updateStates(node.workspaceId, reqContext);
  Log.info(`Added or updated form value of ${nodeId} with name ${name}`);

  return true;
};

export const addConnection = async (
  socket: SocketInstance,
  otherSocket: SocketInstance,
  type: 'output' | 'input',
  connId: string,
  reqContext: ApolloContext
) => {
  const targetNode = await tryGetNode(socket.nodeId, reqContext);
  const nodeType = getNodeType(targetNode.type);

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

  if (fulfillsVariableRequirements(type, socket.name, nodeType)) {
    const otherNode = await tryGetNode(otherSocket.nodeId, reqContext);
    const inputDef = (await getOutputDefs(otherNode, reqContext))[
      otherSocket.name
    ];

    await addOrUpdateVariable(
      socket.name,
      {
        dataType: inputDef.dataType,
        displayName: inputDef.displayName,
        state: SocketState.VARIABLE
      },
      socket.nodeId,
      reqContext
    );
  }
};

const fulfillsVariableRequirements = (
  type: string,
  socketName: string,
  nodeType: ServerNodeDef & NodeDef | null
) =>
  type === 'input' &&
  nodeType &&
  hasContextFn(nodeType) &&
  nodeType.inputs[socketName] == null;

export const removeConnection = async (
  socket: SocketInstance,
  type: 'output' | 'input',
  connId: string,
  reqContext: ApolloContext
) => {
  const node = await tryGetNode(socket.nodeId, reqContext);
  const nodeType = getNodeType(node.type);

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

  if (
    nodeType &&
    hasContextFn(nodeType) &&
    nodeType.inputs[socket.name] == null
  ) {
    await deleteVariable(socket.name, socket.nodeId, reqContext);
  }
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

export const addOrUpdateVariable = async (
  varId: string,
  variable: SocketDef,
  nodeId: string,
  reqContext: ApolloContext
) => {
  const node = await tryGetNode(nodeId, reqContext);
  const coll = getNodesCollection(reqContext.db);
  await coll.updateOne(
    { _id: new ObjectID(nodeId) },
    {
      $set: { [`variables.${varId}`]: variable }
    }
  );

  await updateStates(node.workspaceId, reqContext);
  Log.info(`Created variable ${varId}`);
  return true;
};

export const deleteVariable = async (
  varId: string,
  nodeId: string,
  reqContext: ApolloContext
) => {
  const node = await tryGetNode(nodeId, reqContext);
  const coll = getNodesCollection(reqContext.db);
  await coll.updateOne(
    { _id: new ObjectID(nodeId) },
    {
      $unset: { [`variables.${varId}`]: '' }
    }
  );

  await updateStates(node.workspaceId, reqContext);

  Log.info(`Deleted variable ${varId}`);
  return true;
};
