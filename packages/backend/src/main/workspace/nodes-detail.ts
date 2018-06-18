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

import { serverNodeTypes, tryGetNodeType } from '../nodes/all-nodes';
import { getConnection } from './connections';
import { getNode, getNodesCollection, tryGetNode } from './nodes';
import { isNodeInMetaValid } from '../calculation/validation';

export const getContextInputDefs = async (
  node: NodeInstance,
  db: Db
): Promise<SocketDefs<any> | null> => {
  if (serverNodeTypes.has(node.type)) {
    return null;
  }

  const parent = await getParentNode(node, db);
  const parentType = serverNodeTypes.get(parent.type)!;
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(db, parent.id);
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
  if (serverNodeTypes.has(node.type)) {
    return null;
  }

  const parent = await getParentNode(node, db);
  const parentType = serverNodeTypes.get(parent.type)!;
  if (!hasContextFn(parentType)) {
    return null;
  }

  const parentInputs = await getMetaInputs(db, parent.id);
  const contextInputDefs = await parentType.transformInputDefsToContextInputDefs(
    parentType.inputs,
    parentInputs,
    db
  );

  const nodesColl = getNodesCollection(db);
  const contextInputNode = await nodesColl.findOne({
    contextIds: node.contextIds,
    type: ContextNodeType.INPUT
  });
  if (!contextInputNode) {
    throw new Error('Context input node unknown');
  }

  const contextInputs = await getMetaInputs(
    db,
    contextInputNode._id.toHexString()
  );

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
  const nodeType = serverNodeTypes.get(node.type);
  if (!nodeType) {
    return {};
  }

  const allInputs = await getMetaInputs(db, nodeId);

  return await nodeType.onMetaExecution(
    parseNodeForm(node.form),
    allInputs,
    db
  );
};

export const getMetaInputs = async (
  db: Db,
  nodeId: string
): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> => {
  const inputs = {};

  const node = await getNode(db, nodeId);
  if (!node) {
    throw new Error('Metas: Node not found');
  }

  const inputConns = node.inputs;

  await Promise.all(
    inputConns.map(async c => {
      const conn = await getConnection(db, c.connectionId);
      if (!conn) {
        throw new Error('Invalid connection');
      }

      inputs[c.name] = (await getMetaOutputs(db, conn.from.nodeId))[
        conn.from.name
      ];
    })
  );

  return inputs;
};

export const getAllMetaInputs = async (node: NodeInstance, db: Db) => {
  let inputDefs: SocketDefs<any> = {};
  if (node.type === ContextNodeType.INPUT) {
    const parent = await getParentNode(node, db);
    const parentType = tryGetNodeType(parent);
    inputDefs = parentType.inputs;
  } else if (node.type === ContextNodeType.OUTPUT) {
    inputDefs = (await getContextOutputDefs(node, db)) || {};
  } else {
    const type = tryGetNodeType(node);
    inputDefs = type.inputs;
  }

  let inputs: { [name: string]: SocketMetaDef } = {};

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

      const conn = await getConnection(db, connection.connectionId);
      if (!conn) {
        throw new Error('Invalid connection');
      }

      inputs[connection.name] = (await getMetaOutputs(db, conn.from.nodeId))[
        conn.from.name
      ];
    })
  );

  return inputs;
};

export const getNodeState = async (node: NodeInstance, db: Db) => {
  const t = serverNodeTypes.get(node.type);
  if (!t) {
    return NodeState.ERROR;
  }

  const isValid = await isNodeInMetaValid(node, db);
  if (!isValid) {
    return NodeState.INVALID;
  }

  return NodeState.VALID;
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

  const node = await getNode(db, nodeId);
  if (!node) {
    throw new Error('Node does not exist');
  }

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
