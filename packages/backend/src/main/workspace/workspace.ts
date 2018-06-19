import {
  ConnectionInstance,
  NodeInstance,
  Workspace
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { getConnectionsCollection } from './connections';
import { getNodesCollection } from './nodes';

export const initWorkspaceDb = async (db: Db) => {
  const connCollection = getConnectionsCollection(db);
  const nodesCollection = getNodesCollection(db);
  await connCollection.createIndex('workspaceId');
  await nodesCollection.createIndex('workspaceId');
  return true;
};

export const getWorkspacesCollection = (
  db: Db
): Collection<Workspace & { _id: ObjectID }> => {
  return db.collection('Workspaces');
};

export const createWorkspace = async (
  db: Db,
  name: string,
  description: string | null
): Promise<Workspace> => {
  const wsCollection = getWorkspacesCollection(db);
  if (!name.length) {
    throw new Error('Name of workspace must not be empty.');
  }

  const res = await wsCollection.insertOne({
    name,
    description: description || '',
    lastChange: new Date(),
    created: new Date()
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing workspace failed');
  }

  const newItem = res.ops[0];
  return {
    id: newItem._id.toHexString(),
    ...newItem
  };
};

export const deleteWorkspace = async (db: Db, id: string) => {
  if (!ObjectID.isValid(id)) {
    throw new Error('Invalid ID');
  }

  const wsCollection = getWorkspacesCollection(db);
  const connectionsCollection = getConnectionsCollection(db);
  const nodesCollection = getNodesCollection(db);

  const wsRes = await wsCollection.deleteOne({ _id: new ObjectID(id) });

  if (wsRes.result.ok !== 1 || wsRes.deletedCount !== 1) {
    throw new Error('Deletion of Workspace failed.');
  }

  await Promise.all([
    nodesCollection.deleteMany({ workspaceId: id }),
    connectionsCollection.deleteMany({ workspaceId: id })
  ]);

  return true;
};

export const updateWorkspace = async (
  db: Db,
  id: string,
  nodes: Array<NodeInstance>,
  connections: Array<ConnectionInstance>
) => {
  if (!ObjectID.isValid(id)) {
    throw new Error('Invalid ID');
  }

  const nodesCollection = getNodesCollection(db);
  await Promise.all(
    nodes.map(n =>
      nodesCollection.updateOne(
        { _id: new ObjectID(n.id) },
        { $set: { x: n.x, y: n.y, type: n.type } }
      )
    )
  );

  const connectionsCollection = getConnectionsCollection(db);
  await Promise.all(
    connections.map(c =>
      connectionsCollection.updateOne(
        { _id: new ObjectID(c.id) },
        { $set: { from: c.from, to: c.to } }
      )
    )
  );

  await updateLastChange(db, id);

  return true;
};

export const updateLastChange = async (db: Db, wsId: string) => {
  const wsCollection = getWorkspacesCollection(db);
  await wsCollection.findOneAndUpdate(
    { _id: new ObjectID(wsId) },
    { $set: { lastChange: new Date() } }
  );
};

export const getAllWorkspaces = async (db: Db): Promise<Array<Workspace>> => {
  const wsCollection = getWorkspacesCollection(db);
  const all = await wsCollection.find().toArray();
  return all.map(ws => ({
    id: ws._id.toHexString(),
    ...ws
  }));
};

export const getWorkspace = async (
  db: Db,
  id: string
): Promise<Workspace & { _id: ObjectID } | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const wsCollection = getWorkspacesCollection(db);
  const ws = await wsCollection.findOne({
    _id: new ObjectID(id)
  });
  if (!ws) {
    return null;
  }

  return {
    id: ws._id.toHexString(),
    ...ws
  };
};
