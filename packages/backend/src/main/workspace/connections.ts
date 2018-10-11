import {
  ApolloContext,
  ConnectionInstance,
  DataType,
  hasContextFn,
  NodeInstance,
  SocketInstance
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import { Log } from '../../logging';
import { Omit } from '../../main';
import { getNodeType } from '../nodes/all-nodes';
import { getSafeObjectID } from '../utils';
import { tryGetNode } from './nodes';
import {
  addConnection,
  getInputDefs,
  getOutputDefs,
  removeConnection
} from './nodes-detail';
import { updateStates } from './nodes-state';

export const getConnectionsCollection = <
  T = ConnectionInstance & { _id: ObjectID }
>(
  db: Db
) => db.collection<T>('Connections');

export const createConnection = async (
  from: SocketInstance,
  to: SocketInstance,
  reqContext: ApolloContext
): Promise<ConnectionInstance> => {
  await validateConnection(from, to, reqContext);

  const destination = await tryGetNode(to.nodeId, reqContext);
  const collection = getConnectionsCollection<Omit<ConnectionInstance, 'id'>>(
    reqContext.db
  );
  const insertRes = await collection.insertOne({
    from,
    to,
    contextIds: destination.contextIds,
    workspaceId: destination.workspaceId
  });

  if (insertRes.result.ok !== 1 || insertRes.ops.length !== 1) {
    throw new Error('Writing connection failed');
  }

  const { _id, ...newItem } = insertRes.ops[0];
  const connId = _id.toHexString();

  await Promise.all([
    addConnection(from, to, 'output', connId, reqContext),
    addConnection(to, from, 'input', connId, reqContext)
  ]);

  await updateStates(destination.workspaceId, reqContext);

  Log.info(`Connection ${connId} created`);

  return {
    id: _id.toHexString(),
    ...newItem
  };
};

const validateConnection = async (
  from: SocketInstance,
  to: SocketInstance,
  reqContext: ApolloContext
) => {
  if (!from || !to) {
    throw new Error('Invalid connection');
  }

  const destination = await tryGetNode(to.nodeId, reqContext);
  const collection = getConnectionsCollection(reqContext.db);
  const res = await collection.findOne({
    'to.name': to.name,
    'to.nodeId': to.nodeId
  });
  if (res !== null) {
    throw new Error('Only one input allowed');
  }

  const source = await tryGetNode(from.nodeId, reqContext);
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
};

const checkAndGetDataType = async (
  from: SocketInstance,
  to: SocketInstance,
  source: NodeInstance,
  destination: NodeInstance,
  reqContext
): Promise<DataType> => {
  const sourceDefs = await getOutputDefs(source, reqContext);

  const expectedDatatype = sourceDefs[from.name]
    ? sourceDefs[from.name].dataType
    : null;
  if (!expectedDatatype) {
    throw new Error('Unknown output socket');
  }

  const destinationNodeType = getNodeType(destination.type);
  if (destinationNodeType && hasContextFn(destinationNodeType)) {
    // might be a variable
    return expectedDatatype;
  }

  await checkDatatypeIsValidAndMatches(
    expectedDatatype,
    destination,
    to,
    reqContext
  );

  return expectedDatatype;
};

const checkDatatypeIsValidAndMatches = async (
  expectedDatatype: DataType,
  destination: NodeInstance,
  to: SocketInstance,
  reqContext: ApolloContext
) => {
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

  await Promise.all([
    tryGetNode(connection.from.nodeId, reqContext),
    tryGetNode(connection.to.nodeId, reqContext)
  ]);

  await Promise.all([
    removeConnection(connection.from, 'output', connection.id, reqContext),
    removeConnection(connection.to, 'input', connection.id, reqContext)
  ]);

  const connCollection = getConnectionsCollection(reqContext.db);
  await connCollection.deleteOne({ _id: getSafeObjectID(id) });

  await updateStates(connection.workspaceId, reqContext);

  Log.info(`Connection ${id} deleted`);

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
): Promise<ConnectionInstance | null> => {
  const collection = getConnectionsCollection(reqContext.db);
  const res = await collection.findOne({ _id: getSafeObjectID(id) });
  if (!res) {
    return null;
  }

  const { _id, ...obj } = res;

  return {
    id: res._id.toHexString(),
    ...obj
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
