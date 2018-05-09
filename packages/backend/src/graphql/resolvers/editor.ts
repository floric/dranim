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
  state: NodeState;
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
}

export interface Editor {
  nodes: Array<Node>;
  connections: Array<Connection>;
}

export const getNodesCollection = (db: Db) => {
  return db.collection('Nodes');
};

export const getConnectionsCollection = (db: Db) => {
  return db.collection('Connections');
};

export const addOrUpdateFormValue = async (
  db: Db,
  nodeId: ObjectID,
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

  const collection = getNodesCollection(db);

  let res;
  if (node.form.find(f => f.name === name) !== undefined) {
    const form = node.form.map(f => (f.name !== name ? f : { name, value }));
    res = await collection.updateOne({ _id: nodeId }, { $set: { form } });
  } else {
    res = await collection.updateOne(
      { _id: nodeId },
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

  const all = await allConnections(db);
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

  res = await collection.insertOne({ from, to });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing connection failed');
  }

  const newItem = res.ops[0];
  const connId = newItem._id;

  const nodesCollection = getNodesCollection(db);
  await nodesCollection.updateOne(
    { _id: new ObjectID(from.nodeId) },
    { $push: { outputs: { name: from.name, connectionId: connId } } }
  );
  await nodesCollection.updateOne(
    { _id: new ObjectID(to.nodeId) },
    { $push: { inputs: { name: to.name, connectionId: connId } } }
  );

  return {
    id: newItem._id,
    ...newItem
  };
};

export const deleteConnection = async (db: Db, id: ObjectID) => {
  const collection = getConnectionsCollection(db);
  const nodesCollection = getNodesCollection(db);
  const connection = await getConnection(db, id);
  if (!connection) {
    throw new Error('Connection not known.');
  }

  const outputNode = await getNode(db, new ObjectID(connection.from.nodeId));
  const inputNode = await getNode(db, new ObjectID(connection.to.nodeId));

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

  const res = await collection.deleteOne({ _id: id });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting connection failed');
  }

  return true;
};

export const createNode = async (
  db: Db,
  type: string,
  x: number,
  y: number
): Promise<Node> => {
  const collection = getNodesCollection(db);
  if (type.length === 0) {
    throw new Error("Name mustn't be empty.");
  }

  const res = await collection.insertOne({
    x,
    y,
    form: [],
    outputs: [],
    inputs: [],
    type
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing node failed');
  }

  const newItem = res.ops[0];
  return {
    id: newItem._id,
    ...newItem
  };
};

export const deleteNode = async (db: Db, id: ObjectID) => {
  const connectionsCollection = getConnectionsCollection(db);
  await connectionsCollection.deleteMany({ 'from.nodeId': id.toHexString() });
  await connectionsCollection.deleteMany({ 'to.nodeId': id.toHexString() });

  const nodesCollection = getNodesCollection(db);
  const res = await nodesCollection.deleteOne({ _id: id });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting node failed');
  }

  return true;
};
export const updateNode = async (
  db: Db,
  id: ObjectID,
  x: number,
  y: number
) => {
  const collection = getNodesCollection(db);
  const res = await collection.findOneAndUpdate(
    { _id: id },
    { $set: { x, y } }
  );

  if (res.ok !== 1) {
    throw new Error('Updating node failed');
  }

  return true;
};

export const allNodes = async (db: Db): Promise<Array<Node>> => {
  const collection = getNodesCollection(db);
  const all = await collection.find({}).toArray();
  return all.map(ds => ({
    id: ds._id,
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

export const getNode = async (db: Db, id: ObjectID): Promise<Node | null> => {
  const collection = getNodesCollection(db);
  const node = await collection.findOne({ _id: id });
  if (!node) {
    return null;
  }

  return {
    id: node._id,
    ...node
  };
};

export const getConnection = async (
  db: Db,
  id: ObjectID
): Promise<Connection | null> => {
  const collection = getConnectionsCollection(db);
  const connection = await collection.findOne({ _id: id });
  if (!connection) {
    return null;
  }

  return {
    id: connection._id,
    ...connection
  };
};

export const allConnections = async (db: Db): Promise<Array<Connection>> => {
  const collection = getConnectionsCollection(db);
  const all = await collection.find({}).toArray();
  return all.map(ds => ({
    id: ds._id,
    ...ds
  }));
};

export const updateEditor = async (
  db: Db,
  nodes: Array<Node>,
  connections: Array<Connection>
) => {
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

  return true;
};

export const editor = async (db: Db): Promise<Editor> => {
  return { nodes: await allNodes(db), connections: await allConnections(db) };
};
