import { Db, Collection, ObjectID } from 'mongodb';
import { NodeInstance, NodeState, parseNodeForm } from '@masterthesis/shared';
import { getWorkspace, getWorkspacesCollection } from './workspace';
import { getConnectionsCollection } from './connections';
import { serverNodeTypes } from '../nodes/AllNodes';

export const getNodesCollection = (
  db: Db
): Collection<NodeInstance & { _id: ObjectID }> => {
  return db.collection('Nodes');
};

export const createNode = async (
  db: Db,
  type: string,
  workspaceId: string,
  x: number,
  y: number
): Promise<NodeInstance> => {
  const collection = getNodesCollection(db);
  if (type.length === 0) {
    throw new Error("Name mustn't be empty.");
  }

  const ws = await getWorkspace(db, workspaceId);
  if (!ws) {
    throw new Error('Unknown workspace!');
  }

  const res = await collection.insertOne({
    x,
    y,
    outputs: [],
    inputs: [],
    workspaceId,
    type
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing node failed');
  }

  const newItem = res.ops[0];
  return {
    id: newItem._id.toHexString(),
    form: [],
    ...newItem
  };
};

export const deleteNode = async (db: Db, id: string) => {
  if (!ObjectID.isValid(id)) {
    throw new Error('Invalid ID');
  }

  const connectionsCollection = getConnectionsCollection(db);
  await connectionsCollection.deleteMany({ 'from.nodeId': id });
  await connectionsCollection.deleteMany({ 'to.nodeId': id });

  const nodesCollection = getNodesCollection(db);
  const res = await nodesCollection.deleteOne({ _id: new ObjectID(id) });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting node failed');
  }

  return true;
};

export const updateNode = async (db: Db, id: string, x: number, y: number) => {
  if (!ObjectID.isValid(id)) {
    throw new Error('Invalid ID.');
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

export const getNodeState = async (db: Db, node: NodeInstance) => {
  const t = serverNodeTypes.get(node.type);
  if (!t) {
    return NodeState.ERROR;
  }

  const isValid = t.isFormValid ? t.isFormValid(parseNodeForm(node)) : true;
  if (!isValid) {
    return NodeState.INVALID;
  }

  if (node.inputs.length !== Object.keys(t.inputs).length) {
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
    throw new Error('Not form value name specified.');
  }

  const node = await getNode(db, nodeId);
  if (!node) {
    throw new Error("Node doesn't exist.");
  }

  const nodeObjId = new ObjectID(nodeId);

  const collection = getNodesCollection(db);

  const res = await collection.updateOne(
    { _id: nodeObjId },
    { $set: { [`form.${name}`]: value } }
  );

  if (res.result.ok !== 1) {
    throw new Error('Adding or updating form value failed.');
  }

  return true;
};
