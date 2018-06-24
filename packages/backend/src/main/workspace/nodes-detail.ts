import {
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  NodeState,
  parseNodeForm,
  SocketDef,
  SocketDefs,
  SocketInstance,
  SocketMetaDef,
  SocketMetas
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import { isNodeInMetaValid } from '../calculation/validation';
import { getNodeType, hasNodeType, tryGetNodeType } from '../nodes/all-nodes';
import { tryGetConnection } from './connections';
import { getNode, getNodesCollection, tryGetNode } from './nodes';

export const getContextInputDefs = async (
  node: NodeInstance,
  db: Db
): Promise<SocketDefs<any> | null> => {
  if (hasNodeType(node.type)) {
    return null;
  }

  const parent = await getParentNode(node, db);
  const parentType = getNodeType(parent.type)!;
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

export const getContextNode = async (
  node: NodeInstance,
  type: ContextNodeType,
  db: Db
): Promise<NodeInstance | null> => {
  const nodesColl = getNodesCollection(db);
  const n = await nodesColl.findOne({
    contextIds: [...node.contextIds, node.id],
    type
  });

  if (!n) {
    return null;
  }

  const { _id, ...res } = n;

  return {
    id: _id.toHexString(),
    ...res
  };
};

export const getContextOutputDefs = async (
  node: NodeInstance,
  db: Db
): Promise<(SocketDefs<any> & { [name: string]: SocketDef }) | null> => {
  if (hasNodeType(node.type)) {
    return null;
  }

  const parent = await getParentNode(node, db);
  const parentType = getNodeType(node.type)!;
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

const getParentNode = async (node: NodeInstance, db: Db) => {
  const parentNodeId = node.contextIds[node.contextIds.length - 1];
  const parent = await getNode(db, parentNodeId);
  if (parent === null) {
    throw new Error('Parent node missing');
  }

  return parent;
};

export const getMetaOutputs = async (
  db: Db,
  nodeId: string
): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> => {
  const node = await tryGetNode(nodeId, db);
  const nodeType = getNodeType(node.type);
  if (!nodeType) {
    return {};
  }

  const allInputs = await getMetaInputs(node, db);
  return await nodeType.onMetaExecution(
    parseNodeForm(node.form),
    allInputs,
    db
  );
};

export const getInputDefs = async (
  node: NodeInstance,
  db: Db
): Promise<SocketDefs<any>> => {
  let inputDefs: SocketDefs<any> = {};
  if (node.type === ContextNodeType.INPUT) {
    const parent = await getParentNode(node, db);
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

export const getMetaInputs = async (node: NodeInstance, db: Db) => {
  const inputDefs = await getInputDefs(node, db);
  const inputs: { [name: string]: SocketMetaDef<any> } = {};

  await Promise.all(
    Object.entries(inputDefs).map(async c => {
      const connection = node.inputs.find(i => i.name === c[0]) || null;
      if (!connection) {
        inputs[c[0]] = {
          isPresent: false,
          content: {}
        };
        return;
      }

      const conn = await tryGetConnection(connection.connectionId, db);
      inputs[connection.name] = (await getMetaOutputs(db, conn.from.nodeId))[
        conn.from.name
      ];
    })
  );

  return inputs;
};

export const getNodeState = async (node: NodeInstance, db: Db) => {
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
