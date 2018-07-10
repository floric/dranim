import {
  ApolloContext,
  ConnectionInstance,
  DataType,
  hasContextFn,
  NodeInstance,
  SocketInstance
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { Logger } from '../../logging';
import { getNodeType } from '../nodes/all-nodes';
import { tryGetNode } from './nodes';
import {
  addConnection,
  getInputDefs,
  getOutputDefs,
  removeConnection
} from './nodes-detail';
import { updateStates } from './nodes-state';

export const getConnectionsCollection = (
  db: Db
): Collection<ConnectionInstance & { _id: ObjectID }> =>
  db.collection('Connections');

export const createConnection = async (
  from: SocketInstance,
  to: SocketInstance,
  reqContext: ApolloContext
): Promise<ConnectionInstance> => {
  if (!from || !to) {
    throw new Error('Invalid connection');
  }

  const collection = getConnectionsCollection(reqContext.db);

  // check for existing connections to the input
  const res = await collection.findOne({
    'to.name': to.name,
    'to.nodeId': to.nodeId
  });
  if (res !== null) {
    throw new Error('Only one input allowed');
  }

  const source = await tryGetNode(from.nodeId, reqContext);
  const destination = await tryGetNode(to.nodeId, reqContext);
  checkNodes(destination, source);
  await checkAndGetDataType(from, to, source, destination, reqContext);

  const hasFoundCycles = await containsCycles(
    destination,
    from,
    to,
    reqContext
  );
  if (hasFoundCycles) {
    throw new Error('Cyclic dependencies not allowed');
  }

  const insertRes = await collection.insertOne({
    from,
    to,
    contextIds: destination.contextIds,
    workspaceId: destination.workspaceId
  });

  if (insertRes.result.ok !== 1 || insertRes.ops.length !== 1) {
    throw new Error('Writing connection failed');
  }

  const newItem = insertRes.ops[0];
  const connId = newItem._id.toHexString();

  await Promise.all([
    addConnection(from, to, 'output', connId, reqContext),
    addConnection(to, from, 'input', connId, reqContext)
  ]);

  await updateStates(destination.workspaceId, reqContext);

  Logger.info(`Connection ${connId} created`);

  return {
    id: newItem._id.toHexString(),
    ...newItem
  };
};

const checkAndGetDataType = async (
  from: SocketInstance,
  to: SocketInstance,
  source: NodeInstance,
  destination: NodeInstance,
  reqContext
): Promise<DataType> => {
  const destinationNodeType = getNodeType(destination.type);
  const sourceDefs = await getOutputDefs(source, reqContext);

  const expectedDatatype = sourceDefs[from.name]
    ? sourceDefs[from.name].dataType
    : null;
  if (!expectedDatatype) {
    throw new Error('Unknown output socket');
  }

  if (destinationNodeType && hasContextFn(destinationNodeType)) {
    // might be a variable
    return expectedDatatype;
  }

  const destinationDefs = await getInputDefs(destination, reqContext);
  const matchedDatatype = destinationDefs[to.name]
    ? destinationDefs[to.name].dataType
    : null;
  if (!matchedDatatype) {
    throw new Error('Unknown input socket');
  }

  if (expectedDatatype !== matchedDatatype) {
    throw new Error('Datatypes dont match');
  }

  return expectedDatatype;
};

const checkNodes = (inputNode: NodeInstance, outputNode: NodeInstance) => {
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
  inputNode: NodeInstance,
  from: SocketInstance,
  to: SocketInstance,
  reqContext: ApolloContext
): Promise<boolean> => {
  const all = await getAllConnections(inputNode.workspaceId, reqContext);

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

export const deleteConnection = async (
  id: string,
  reqContext: ApolloContext
) => {
  const connection = await getConnection(id, reqContext);
  if (!connection) {
    return true;
  }

  await tryGetNode(connection.from.nodeId, reqContext);
  await tryGetNode(connection.to.nodeId, reqContext);

  await Promise.all([
    removeConnection(connection.from, 'output', connection.id, reqContext),
    removeConnection(connection.to, 'input', connection.id, reqContext)
  ]);

  const connCollection = getConnectionsCollection(reqContext.db);
  await connCollection.deleteOne({ _id: new ObjectID(id) });

  await updateStates(connection.workspaceId, reqContext);

  Logger.info(`Connection ${id} deleted`);

  return true;
};

export const tryGetConnection = async (
  id: string,
  reqContext: ApolloContext
) => {
  const conn = await getConnection(id, reqContext);
  if (!conn) {
    throw new Error('Invalid connection');
  }

  return conn;
};

export const getConnection = async (
  id: string,
  reqContext: ApolloContext
): Promise<ConnectionInstance & { _id: ObjectID } | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getConnectionsCollection(reqContext.db);
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
  workspaceId: string,
  reqContext: ApolloContext
): Promise<Array<ConnectionInstance>> => {
  const collection = getConnectionsCollection(reqContext.db);
  const all = await collection.find({ workspaceId }).toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};

export const deleteConnectionsInContext = async (
  contextId: string,
  reqContext: ApolloContext
) => {
  const connectionsCollection = getConnectionsCollection(reqContext.db);
  await connectionsCollection.deleteMany({
    contextIds: { $elemMatch: { $eq: contextId } }
  });
};
