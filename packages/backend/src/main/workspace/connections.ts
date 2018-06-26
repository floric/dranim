import {
  ConnectionInstance,
  NodeInstance,
  SocketInstance
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { getNode, tryGetNode } from './nodes';
import { addConnection, removeConnection } from './nodes-detail';

export const getConnectionsCollection = (
  db: Db
): Collection<ConnectionInstance & { _id: ObjectID }> => {
  return db.collection('Connections');
};

export const createConnection = async (
  from: SocketInstance,
  to: SocketInstance,
  db: Db
): Promise<ConnectionInstance> => {
  if (!from || !to) {
    throw new Error('Invalid connection');
  }

  const collection = getConnectionsCollection(db);

  // check for existing connections to the input
  const res = await collection.findOne({
    'to.name': to.name,
    'to.nodeId': to.nodeId
  });
  if (res !== null) {
    throw new Error('Only one input allowed');
  }

  const outputNode = await getNode(db, from.nodeId);
  const inputNode = await getNode(db, to.nodeId);
  checkNodes(inputNode, outputNode);

  const hasFoundCycles = await containsCycles(db, inputNode!, from, to);
  if (hasFoundCycles) {
    throw new Error('Cyclic dependencies not allowed');
  }

  const insertRes = await collection.insertOne({
    from,
    to,
    contextIds: inputNode!.contextIds,
    workspaceId: inputNode!.workspaceId
  });

  if (insertRes.result.ok !== 1 || insertRes.ops.length !== 1) {
    throw new Error('Writing connection failed');
  }

  const newItem = insertRes.ops[0];
  const connId = newItem._id.toHexString();

  await Promise.all([
    addConnection(db, from, 'output', connId),
    addConnection(db, to, 'input', connId)
  ]);

  return {
    id: newItem._id.toHexString(),
    ...newItem
  };
};

const checkNodes = (
  inputNode: NodeInstance | null,
  outputNode: NodeInstance | null
) => {
  if (!outputNode || !inputNode) {
    throw new Error('Unknown node');
  }

  if (inputNode.workspaceId !== outputNode.workspaceId) {
    throw new Error('Nodes live in different workspaces');
  }

  if (
    inputNode.contextIds[inputNode.contextIds.length - 1] !==
    outputNode.contextIds[outputNode.contextIds.length - 1]
  ) {
    throw new Error('Nodes live in different contexts');
  }
};

const containsCycles = async (
  db: Db,
  inputNode: NodeInstance,
  from: SocketInstance,
  to: SocketInstance
): Promise<boolean> => {
  const all = await getAllConnections(db, inputNode.workspaceId);

  let foundCycle = false;
  let curFromSocket: SocketInstance = from;

  while (foundCycle === false) {
    if (curFromSocket.nodeId === to.nodeId) {
      foundCycle = true;
      break;
    } else {
      const inputConnection = all.find(
        s => s.to.nodeId === curFromSocket.nodeId
      );
      if (inputConnection !== undefined) {
        curFromSocket = inputConnection.from;
      } else {
        // nothing found
        break;
      }
    }
  }

  return foundCycle;
};

export const deleteConnection = async (db: Db, id: string) => {
  const connection = await tryGetConnection(id, db);
  await tryGetNode(connection.from.nodeId, db);
  await tryGetNode(connection.to.nodeId, db);

  await Promise.all([
    removeConnection(db, connection.from, 'output', connection.id),
    removeConnection(db, connection.to, 'input', connection.id)
  ]);

  const connCollection = getConnectionsCollection(db);
  const res = await connCollection.deleteOne({ _id: new ObjectID(id) });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting connection failed');
  }

  return true;
};

export const tryGetConnection = async (id: string, db: Db) => {
  const conn = await getConnection(id, db);
  if (!conn) {
    throw new Error('Invalid connection');
  }

  return conn;
};

export const getConnection = async (
  id: string,
  db: Db
): Promise<ConnectionInstance & { _id: ObjectID } | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getConnectionsCollection(db);
  const connection = await collection.findOne({ _id: new ObjectID(id) });
  if (!connection) {
    return null;
  }

  return {
    id: connection._id.toHexString(),
    ...connection
  };
};

export const getAllConnections = async (
  db: Db,
  workspaceId: string
): Promise<Array<ConnectionInstance>> => {
  const collection = getConnectionsCollection(db);
  const all = await collection.find({ workspaceId }).toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};
