import {
  ConnectionInstance,
  NodeInstance,
  SocketInstance
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';
import { getNode, getNodesCollection } from './nodes';

export const getConnectionsCollection = (
  db: Db
): Collection<ConnectionInstance & { _id: ObjectID }> => {
  return db.collection('Connections');
};

export const createConnection = async (
  db: Db,
  from: SocketInstance,
  to: SocketInstance
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

  const nodesCollection = getNodesCollection(db);
  const outputNode = await nodesCollection.findOne<NodeInstance>({
    _id: new ObjectID(from.nodeId)
  });
  const inputNode = await nodesCollection.findOne<NodeInstance>({
    _id: new ObjectID(to.nodeId)
  });

  if (!outputNode || !inputNode) {
    throw new Error('Unknown node!');
  }

  if (inputNode.workspaceId !== outputNode.workspaceId) {
    throw new Error('Nodes live in different workspaes!');
  }

  const hasFoundCycles = await containsCycles(db, inputNode!, from, to);
  if (hasFoundCycles) {
    throw new Error('Cyclic dependencies not allowed!');
  }

  const insertRes = await collection.insertOne({
    from,
    to,
    workspaceId: inputNode!.workspaceId
  });

  if (insertRes.result.ok !== 1 || insertRes.ops.length !== 1) {
    throw new Error('Writing connection failed');
  }

  const newItem = insertRes.ops[0];
  const connId = newItem._id.toHexString();

  await Promise.all([
    nodesCollection.updateOne(
      { _id: new ObjectID(from.nodeId) },
      { $push: { outputs: { name: from.name, connectionId: connId } } }
    ),
    nodesCollection.updateOne(
      { _id: new ObjectID(to.nodeId) },
      { $push: { inputs: { name: to.name, connectionId: connId } } }
    )
  ]);

  return {
    id: newItem._id.toHexString(),
    ...newItem
  };
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
  const connection = await getConnection(db, id);
  if (!connection) {
    throw new Error('Connection not known.');
  }

  const connCollection = getConnectionsCollection(db);
  const nodesCollection = getNodesCollection(db);

  const outputNode = await getNode(db, connection.from.nodeId);
  const inputNode = await getNode(db, connection.to.nodeId);

  if (!outputNode || !inputNode) {
    throw new Error('Unknown nodes as input or output!');
  }

  await nodesCollection.updateMany(
    { _id: new ObjectID(connection.from.nodeId) },
    {
      $pull: {
        outputs: {
          name: connection.from.name,
          connectionId: connection.id
        }
      }
    }
  );
  await nodesCollection.updateOne(
    { _id: new ObjectID(connection.to.nodeId) },
    {
      $pull: {
        inputs: {
          name: connection.to.name,
          connectionId: connection.id
        }
      }
    }
  );

  const res = await connCollection.deleteOne({ _id: new ObjectID(id) });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting connection failed');
  }

  return true;
};

export const getConnection = async (
  db: Db,
  id: string
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
