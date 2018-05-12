import { MongoClient, ObjectID, Db } from 'mongodb';
import { nodeTypes } from '../../nodes/AllNodes';

export type FormValues = Array<{ name: string; value: any }>;

export enum NodeState {
  VALID = 'VALID',
  ERROR = 'ERROR',
  INVALID = 'INVALID'
}

export interface Node {
  id: string;
  x: number;
  y: number;
  workspaceId: string;
  outputs: Array<{ name: string; connectionId: string }>;
  inputs: Array<{ name: string; connectionId: string }>;
  type: string;
  form: FormValues;
}

export interface Socket {
  nodeId: string;
  name: string;
}

export interface Connection extends ConnectionWithoutId {
  id: string;
}

export interface ConnectionWithoutId {
  from: Socket;
  to: Socket;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  lastChange: string;
  created: string;
  description: string;
  nodes: Array<Node>;
  connections: Array<Connection>;
}

export const initWorkspaceDb = async (db: Db) => {
  const connCollection = getConnectionsCollection(db);
  const nodesCollection = getNodesCollection(db);
  await connCollection.createIndex('workspaceId');
  await nodesCollection.createIndex('workspaceId');
};

export const getNodesCollection = (db: Db) => {
  return db.collection('Nodes');
};

export const getWorkspacesCollection = (db: Db) => {
  return db.collection('Workspaces');
};

export const getConnectionsCollection = (db: Db) => {
  return db.collection('Connections');
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

  let res;
  if (node.form.find(f => f.name === name) !== undefined) {
    const form = node.form.map(f => (f.name !== name ? f : { name, value }));
    res = await collection.updateOne({ _id: nodeObjId }, { $set: { form } });
  } else {
    res = await collection.updateOne(
      { _id: nodeObjId },
      { $push: { form: { name, value } } }
    );
  }

  if (res.result.ok !== 1) {
    throw new Error('Adding or updating form value failed.');
  }

  return true;
};

export const createConnection = async (db: Db, from: Socket, to: Socket) => {
  if (!from || !to) {
    throw new Error('Invalid connection');
  }

  const collection = getConnectionsCollection(db);

  // check for existing connections to the input
  let res = await collection.findOne({
    'to.name': to.name,
    'to.nodeId': to.nodeId
  });
  if (res !== null) {
    throw new Error('Only one input allowed');
  }

  const nodesCollection = getNodesCollection(db);
  const outputNode = await nodesCollection.findOne<Node>({
    _id: new ObjectID(from.nodeId)
  });
  const inputNode = await nodesCollection.findOne<Node>({
    _id: new ObjectID(to.nodeId)
  });
  if (!outputNode || !inputNode) {
    throw new Error('Unknown node!');
  }

  if (inputNode.workspaceId !== outputNode.workspaceId) {
    throw new Error('Nodes live in different workspaes!');
  }

  const all = await getAllConnections(db, inputNode.workspaceId);
  let foundCircle = false;
  let curFromSocket: Socket = from;
  while (foundCircle === false) {
    if (curFromSocket.nodeId === to.nodeId) {
      foundCircle = true;
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

  if (foundCircle) {
    throw new Error('Cyclic dependencies not allowed!');
  }

  res = await collection.insertOne({
    from,
    to,
    workspaceId: inputNode.workspaceId
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing connection failed');
  }

  const newItem = res.ops[0];
  const connId = newItem._id;

  await nodesCollection.updateOne(
    { _id: new ObjectID(from.nodeId) },
    { $push: { outputs: { name: from.name, connectionId: connId } } }
  );
  await nodesCollection.updateOne(
    { _id: new ObjectID(to.nodeId) },
    { $push: { inputs: { name: to.name, connectionId: connId } } }
  );

  return {
    id: newItem._id.toHexString(),
    ...newItem
  };
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

  await nodesCollection.updateOne(
    { _id: new ObjectID(outputNode.id) },
    {
      $set: {
        outputs: outputNode.outputs.filter(
          n =>
            n.name !== connection.from.name && n.connectionId !== connection.id
        )
      }
    }
  );
  await nodesCollection.updateOne(
    { _id: new ObjectID(inputNode.id) },
    {
      $set: {
        inputs: inputNode.inputs.filter(
          n => n.name !== connection.to.name && n.connectionId !== connection.id
        )
      }
    }
  );

  const res = await connCollection.deleteOne({ _id: new ObjectID(id) });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting connection failed');
  }

  return true;
};

export const createNode = async (
  db: Db,
  type: string,
  workspaceId: string,
  x: number,
  y: number
): Promise<Node> => {
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
    form: [],
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

  wsCollection.findOneAndUpdate(
    { _id: new ObjectID(res.value.workspaceId) },
    { $set: { lastChange: new Date() } }
  );

  return true;
};

export const getAllNodes = async (
  db: Db,
  workspaceId: string
): Promise<Array<Node>> => {
  const collection = getNodesCollection(db);
  const all = await collection.find({ workspaceId }).toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};

export const getNodeState = async (
  db: Db,
  node: Pick<Node, 'form' | 'inputs' | 'type'>
) => {
  const t = nodeTypes.get(node.type);
  if (!t) {
    return NodeState.ERROR;
  }

  const isValid = t.isFormValid ? t.isFormValid(node.form) : true;
  if (!isValid) {
    return NodeState.INVALID;
  }

  if (node.inputs.length !== t.inputs.length) {
    return NodeState.INVALID;
  }

  return NodeState.VALID;
};

export const getNode = async (db: Db, id: string): Promise<Node | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getNodesCollection(db);
  const node = await collection.findOne({ _id: new ObjectID(id) });
  if (!node) {
    return null;
  }

  return {
    id: node._id.toHexString(),
    ...node
  };
};

export const getConnection = async (
  db: Db,
  id: string
): Promise<Connection | null> => {
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
): Promise<Array<Connection>> => {
  const collection = getConnectionsCollection(db);
  const all = await collection.find({ workspaceId }).toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};

export const createWorkspace = async (
  db: Db,
  name: string,
  description: string | null
) => {
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
  nodes: Array<Node>,
  connections: Array<Connection>
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

  const wsCollection = getWorkspacesCollection(db);
  wsCollection.findOneAndUpdate(
    { _id: new ObjectID(id) },
    { $set: { lastChange: new Date() } }
  );

  return true;
};

export const getAllWorkspaces = async (db: Db): Promise<Array<Workspace>> => {
  const wsCollection = getWorkspacesCollection(db);
  const all = await wsCollection.find().toArray();
  return all.map(ws => ({
    id: ws._id.toHexString(),
    ...ws
  }));
};

export const getWorkspace = async (db: Db, id: string): Promise<Workspace> => {
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
