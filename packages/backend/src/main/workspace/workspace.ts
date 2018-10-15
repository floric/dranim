import { ApolloContext, NodeState, Workspace } from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import { Log } from '../../logging';
import { Omit } from '../../main';
import { checkLoggedInUser } from '../users/management';
import { getSafeObjectID } from '../utils';
import { getConnectionsCollection } from './connections';
import { getAllNodes, getNodesCollection } from './nodes';

export const getWorkspacesCollection = <T = Workspace & { _id: ObjectID }>(
  db: Db
) => db.collection<T>('Workspaces');

export const createWorkspace = async (
  name: string,
  reqContext: ApolloContext,
  description?: string
): Promise<Workspace> => {
  checkLoggedInUser(reqContext);

  const wsCollection = getWorkspacesCollection<
    Omit<Workspace, 'id' | 'lastChange' | 'created'> & {
      lastChange: Date;
      created: Date;
    }
  >(reqContext.db);
  if (!name.length) {
    throw new Error('Name of workspace must not be empty.');
  }

  const res = await wsCollection.insertOne({
    name: name.trim(),
    userId: reqContext.userId!,
    description: description || '',
    lastChange: new Date(),
    created: new Date()
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing workspace failed');
  }

  const { _id, ...newItem } = res.ops[0];

  Log.info(`Workspace ${_id.toHexString()} created`);

  return {
    id: _id.toHexString(),
    ...newItem
  };
};

export const deleteWorkspace = async (
  id: string,
  reqContext: ApolloContext
) => {
  const wsCollection = getWorkspacesCollection(reqContext.db);
  const connectionsCollection = getConnectionsCollection(reqContext.db);
  const nodesCollection = getNodesCollection(reqContext.db);

  const wsRes = await wsCollection.deleteOne({
    _id: getSafeObjectID(id),
    userId: reqContext.userId
  });

  if (wsRes.result.ok !== 1 || wsRes.deletedCount !== 1) {
    throw new Error('Deletion of Workspace failed.');
  }

  await Promise.all([
    nodesCollection.deleteMany({ workspaceId: id }),
    connectionsCollection.deleteMany({ workspaceId: id })
  ]);

  Log.info(`Workspace ${id} deleted`);

  return true;
};

export const renameWorkspace = async (
  id: string,
  name: string,
  reqContext: ApolloContext
) => {
  if (name.length === 0) {
    throw new Error('Name must not be empty.');
  }

  const ws = await tryGetWorkspace(id, reqContext);
  const collection = getWorkspacesCollection(reqContext.db);
  const res = await collection.updateOne(
    { _id: getSafeObjectID(ws.id) },
    {
      $set: { name: name.trim() }
    }
  );

  if (res.modifiedCount !== 1) {
    throw new Error('Updating the name has failed.');
  }

  return true;
};

export const updateLastChange = async (
  wsId: string,
  reqContext: ApolloContext
) => {
  const wsCollection = getWorkspacesCollection(reqContext.db);
  await wsCollection.updateOne(
    { _id: getSafeObjectID(wsId) },
    { $set: { lastChange: new Date() } }
  );
};

export const getAllWorkspaces = async (
  reqContext: ApolloContext
): Promise<Array<Workspace>> => {
  const wsCollection = getWorkspacesCollection(reqContext.db);
  const all = await wsCollection.find({ userId: reqContext.userId }).toArray();
  return all.map(ws => ({
    id: ws._id.toHexString(),
    ...ws
  }));
};

export const getWorkspace = async (
  id: string,
  reqContext: ApolloContext
): Promise<Workspace | null> => {
  const wsCollection = getWorkspacesCollection(reqContext.db);
  const res = await wsCollection.findOne({
    _id: getSafeObjectID(id),
    userId: reqContext.userId
  });
  if (!res) {
    return null;
  }

  const { _id, ...obj } = res;
  return {
    id: res._id.toHexString(),
    ...obj
  };
};

export const tryGetWorkspace = async (
  id: string,
  reqContext: ApolloContext
) => {
  const ws = await getWorkspace(id, reqContext);
  if (!ws) {
    throw new Error('Unknown workspace');
  }

  return ws;
};

export const getWorkspaceState = async (
  id: string,
  reqContext: ApolloContext
): Promise<NodeState> => {
  const nodes = await getAllNodes(id, reqContext);
  return nodes.every(n => n.state === NodeState.VALID)
    ? NodeState.VALID
    : NodeState.INVALID;
};
