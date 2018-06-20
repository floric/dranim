import {
  ContextNodeType,
  hasContextFn,
  NodeInstance,
  ServerNodeDef
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { serverNodeTypes, tryGetNodeType } from '../nodes/all-nodes';
import { deleteConnection, getConnectionsCollection } from './connections';
import { getWorkspace, updateLastChange } from './workspace';

export const getNodesCollection = (
  db: Db
): Collection<NodeInstance & { _id: ObjectID }> => {
  return db.collection('Nodes');
};

export const createNode = async (
  db: Db,
  type: string,
  workspaceId: string,
  contextNodeIds: Array<string>,
  x: number,
  y: number
): Promise<NodeInstance> => {
  const nodeType = tryGetNodeType(type);

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

  const { _id, ...other } = res.ops[0];

  return {
    id: newNodeId,
    form: [],
    ...other
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
  if (nodeType!.isOutputNode === true) {
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
  const res = await collection.findOneAndUpdate(
    { _id: new ObjectID(id) },
    { $set: { x, y } }
  );

  if (res.ok !== 1) {
    throw new Error('Updating node failed');
  }

  await updateLastChange(db, res.value!.workspaceId);

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
    const { _id, ...other } = n;
    return {
      ...other,
      id: _id.toHexString(),
      form: valueNames.map(name => ({ name, value: n.form[name] }))
    };
  });
};

export const getNode = async (
  db: Db,
  id: string
): Promise<NodeInstance | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getNodesCollection(db);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  const valueNames = obj.form ? Object.keys(obj.form) : [];
  const { _id, ...res } = obj;

  return {
    ...res,
    id: _id.toHexString(),
    form: valueNames.map(name => ({ name, value: obj.form[name] }))
  };
};

export const tryGetNode = async (nodeId: string, db: Db) => {
  const node = await getNode(db, nodeId);
  if (!node) {
    throw new Error('Node not found');
  }
  return node;
};

export const resetProgress = async (workspaceId: string, db: Db) => {
  const coll = getNodesCollection(db);
  await coll.updateMany({ workspaceId }, { $set: { progress: null } });
};
