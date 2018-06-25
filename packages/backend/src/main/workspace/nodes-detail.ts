import {
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
  db: Db
): Promise<SocketDefs<any> | null> => {
  if (hasNodeType(node.type)) {
    return null;
  }

  // will only be accessed by context io nodes
  const parent = await tryGetParentNode(node, db);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(parent, db);
  return await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    db
  );
};

export const getContextOutputDefs = async (
  node: NodeInstance,
  db: Db
): Promise<(SocketDefs<any> & { [name: string]: SocketDef }) | null> => {
  if (hasNodeType(node.type)) {
    return null;
  }

  // will only be accessed by context io nodes
  const parent = await tryGetParentNode(node, db);
  const parentType = tryGetNodeType(parent.type);
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(parent, db);
  const contextInputDefs = await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    db
  );

  const contextInputNode = await getContextNode(
    parent,
    ContextNodeType.INPUT,
    db
  );
  if (!contextInputNode) {
    throw new Error('Context input node unknown');
  }

  const contextInputs = await getMetaInputs(contextInputNode, db);

  return await parentType.transformContextInputDefsToContextOutputDefs(
    parentType.inputs,
    parentInputs,
    contextInputDefs,
    contextInputs,
    parseNodeForm(parent.form),
    db
  );
};

const tryGetParentNode = async (node: NodeInstance, db: Db) => {
  if (node.contextIds.length === 0) {
    throw new Error('Node doesnt have context');
  }

  const parentNodeId = node.contextIds[node.contextIds.length - 1];
  const parent = await getNode(db, parentNodeId);
  if (parent === null) {
    throw new Error('Parent node missing');
  }

  return parent;
};

export const getInputDefs = async (
  node: NodeInstance,
  db: Db
): Promise<SocketDefs<any>> => {
  let inputDefs: SocketDefs<any> = {};
  if (node.type === ContextNodeType.INPUT) {
    const parent = await tryGetParentNode(node, db);
    const parentType = tryGetNodeType(parent.type);
    if (hasContextFn(parentType)) {
      return parentType.transformInputDefsToContextInputDefs(
        parentType.inputs,
        await getMetaInputs(parent, db),
        db
      );
    }
  } else if (node.type === ContextNodeType.OUTPUT) {
    inputDefs = (await getContextOutputDefs(node, db)) || {};
  } else {
    const type = tryGetNodeType(node.type);
    inputDefs = type.inputs;
  }

  return inputDefs;
};

export const getNodeState = async (node: NodeInstance, db: Db) => {
  if (
    node.type === ContextNodeType.INPUT ||
    node.type === ContextNodeType.OUTPUT
  ) {
    return await getNodeState(await tryGetParentNode(node, db), db);
  }

  try {
    const isValid = await isNodeInMetaValid(node, db);
    if (!isValid) {
      return NodeState.INVALID;
    }

    return NodeState.VALID;
  } catch (err) {
    return NodeState.ERROR;
  }
};

export const addOrUpdateFormValue = async (
  db: Db,
  nodeId: string,
  name: string,
  value: string
) => {
  if (name.length === 0) {
    throw new Error('No form value name specified');
  }

  await tryGetNode(nodeId, db);
  const nodeObjId = new ObjectID(nodeId);

  const collection = getNodesCollection(db);
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
  db: Db,
  from: SocketInstance,
  type: 'output' | 'input',
  connId: string
) => {
  const nodesCollection = getNodesCollection(db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(from.nodeId) },
    {
      $push: {
        [type === 'input' ? 'inputs' : 'outputs']: {
          name: from.name,
          connectionId: connId
        }
      }
    }
  );
};

export const removeConnection = async (
  db: Db,
  from: SocketInstance,
  type: 'output' | 'input',
  connId: string
) => {
  const nodesCollection = getNodesCollection(db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(from.nodeId) },
    {
      $pull: {
        [type === 'input' ? 'inputs' : 'outputs']: {
          name: from.name,
          connectionId: connId
        }
      }
    }
  );
};

export const setProgress = async (
  nodeId: string,
  value: number | null,
  db: Db
) => {
  if (value !== null && (value < 0 || value > 1)) {
    throw new Error('Invalid progress value');
  }

  const nodesCollection = getNodesCollection(db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(nodeId) },
    {
      $set: { progress: value }
    }
  );
};
