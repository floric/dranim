import {
  ConnectionDescription,
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  NodeState,
  parseNodeForm,
  ServerNodeDef,
  SocketDef,
  SocketDefs,
  SocketMetaDef,
  SocketMetas
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { serverNodeTypes } from '../nodes/all-nodes';
import {
  deleteConnection,
  getConnection,
  getConnectionsCollection
} from './connections';
import { getWorkspace, getWorkspacesCollection } from './workspace';

export const getNodesCollection = (
  db: Db
): Collection<NodeInstance & { _id: ObjectID }> => {
  return db.collection('Nodes');
};

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
    node.form,
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
  const node = await getNode(db, nodeId);
  if (!node) {
    return {};
  }

  const nodeType = serverNodeTypes.get(node.type);
  if (!nodeType) {
    return {};
  }

  const allInputs = await getMetaInputs(db, nodeId, node.inputs);

  return await nodeType.onMetaExecution(parseNodeForm(node), allInputs, db);
};

export const getMetaInputs = async (
  db: Db,
  nodeId: string,
  inputConnections?: Array<ConnectionDescription>
): Promise<SocketMetas<{}> & { [name: string]: SocketMetaDef<any> }> => {
  const inputs = {};

  let inputConns;
  if (!inputConnections) {
    const node = await getNode(db, nodeId);
    if (!node) {
      throw new Error('Metas: Node not found');
    }

    inputConns = node.inputs;
  } else {
    inputConns = inputConnections;
  }

  await Promise.all(
    inputConns.map(async c => {
      const connId = c.connectionId;
      const conn = await getConnection(db, connId);
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

export const createNode = async (
  db: Db,
  type: string,
  workspaceId: string,
  contextNodeIds: Array<string>,
  x: number,
  y: number
): Promise<NodeInstance> => {
  const nodeType = serverNodeTypes.get(type);
  if (!nodeType) {
    throw new Error('Invalid node type');
  }

  await checkNoOutputNodeInContexts(type, contextNodeIds);
  await checkValidContextNode(contextNodeIds, db);
  await checkValidWorkspace(workspaceId, db);

  const collection = getNodesCollection(db);
  const res = await collection.insertOne({
    x,
    y,
    outputs: [],
    inputs: [],
    contextIds: contextNodeIds,
    workspaceId,
    type
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing node failed');
  }

  const newNodeId = res.ops[0]._id.toHexString();

  await addContextNodesIfNecessary(
    nodeType,
    newNodeId,
    contextNodeIds,
    workspaceId,
    db
  );

  return {
    id: newNodeId,
    form: [],
    ...res.ops[0]
  };
};

const addContextNodesIfNecessary = async (
  nodeType: ServerNodeDef,
  newNodeId: string,
  contextNodeIds: Array<string>,
  workspaceId: string,
  db: Db
) => {
  if (hasContextFn(nodeType)) {
    const collection = getNodesCollection(db);
    const nestedContextIds = [...contextNodeIds, newNodeId];
    const contextNodes = [ContextNodeType.INPUT, ContextNodeType.OUTPUT].map(
      contextType => ({
        x: contextType === ContextNodeType.INPUT ? 100 : 600,
        y: 100,
        outputs: [],
        inputs: [],
        contextIds: nestedContextIds,
        workspaceId,
        type: contextType
      })
    );

    await collection.insertMany(contextNodes);
  }
};

const checkValidContextNode = async (contextNodeIds: Array<string>, db: Db) => {
  if (contextNodeIds.length > 0) {
    const contextNode = await getNode(
      db,
      contextNodeIds[contextNodeIds.length - 1]
    );
    if (!contextNode) {
      throw new Error('Unknown context node');
    }
  }
};

const checkNoOutputNodeInContexts = async (
  type: string,
  contextNodeIds: Array<string>
) => {
  if (contextNodeIds.length === 0) {
    return;
  }

  const nodeType = serverNodeTypes.get(type);
  if (!nodeType) {
    return;
  }

  if (nodeType.isOutputNode === true) {
    throw new Error('Output nodes only on root level allowed');
  }
};

const checkValidWorkspace = async (workspaceId: string, db: Db) => {
  const ws = await getWorkspace(db, workspaceId);
  if (!ws) {
    throw new Error('Unknown workspace');
  }
};

export const deleteNode = async (db: Db, id: string) => {
  if (!ObjectID.isValid(id)) {
    throw new Error('Invalid ID');
  }

  const nodeToDelete = await getNode(db, id);
  if (!nodeToDelete) {
    throw new Error('Node does not exist');
  }

  if (
    nodeToDelete.type === ContextNodeType.INPUT ||
    nodeToDelete.type === ContextNodeType.OUTPUT
  ) {
    throw new Error('Must not delete context nodes separately');
  }

  await Promise.all(
    [...nodeToDelete.inputs, ...nodeToDelete.outputs].map(c =>
      deleteConnection(db, c.connectionId)
    )
  );

  const connectionsCollection = getConnectionsCollection(db);
  await connectionsCollection.deleteMany({
    contextIds: { $elemMatch: { $eq: id } }
  });

  const nodesCollection = getNodesCollection(db);
  const res = await nodesCollection.deleteMany({
    $or: [
      { _id: new ObjectID(id) },
      { contextIds: { $elemMatch: { $eq: id } } }
    ]
  });
  if (!res || !res.deletedCount || res.deletedCount < 1) {
    throw new Error('Deleting node failed');
  }

  return true;
};

export const updateNode = async (db: Db, id: string, x: number, y: number) => {
  if (!ObjectID.isValid(id)) {
    throw new Error('Invalid ID');
  }

  const collection = getNodesCollection(db);
  const wsCollection = getWorkspacesCollection(db);
  const res = await collection.findOneAndUpdate(
    { _id: new ObjectID(id) },
    { $set: { x, y } }
  );

  if (res.ok !== 1) {
    throw new Error('Updating node failed');
  }

  await wsCollection.findOneAndUpdate(
    { _id: new ObjectID(res.value!.workspaceId) },
    { $set: { lastChange: new Date() } }
  );

  return true;
};

export const getAllNodes = async (
  db: Db,
  workspaceId: string
): Promise<Array<NodeInstance>> => {
  const collection = getNodesCollection(db);
  const all = await collection.find({ workspaceId }).toArray();
  return all.map(n => {
    const valueNames = n.form ? Object.keys(n.form) : [];
    return {
      ...n,
      id: n._id.toHexString(),
      form: valueNames.map(name => ({ name, value: n.form[name] }))
    };
  });
};

export const getNodeState = async (node: NodeInstance) => {
  const t = serverNodeTypes.get(node.type);
  if (!t) {
    return NodeState.ERROR;
  }

  const isValid = t.isFormValid
    ? await t.isFormValid(parseNodeForm(node))
    : true;
  if (!isValid) {
    return NodeState.INVALID;
  }

  return NodeState.VALID;
};

export const getNode = async (
  db: Db,
  id: string
): Promise<NodeInstance & { _id: ObjectID } | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getNodesCollection(db);
  const node = await collection.findOne({ _id: new ObjectID(id) });
  if (!node) {
    return null;
  }

  const valueNames = node.form ? Object.keys(node.form) : [];

  return {
    ...node,
    id: node._id.toHexString(),
    form: valueNames.map(name => ({ name, value: node.form[name] }))
  };
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
