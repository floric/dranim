import { NodeInstance, NodeState, SocketInstance } from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  createConnection,
  deleteConnection,
  deleteConnectionsInContext,
  getConnection,
  getConnectionsCollection,
  tryGetConnection
} from '../../../src/main/workspace/connections';
import { tryGetNode } from '../../../src/main/workspace/nodes';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';
import { updateStates } from '../../../src/main/workspace/nodes-state';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/nodes-detail');
jest.mock('../../../src/main/workspace/nodes-state');

describe('Connections', () => {
  beforeAll(async () => {
    const { connection, database, mongodbServer } = await getTestMongoDb();
    conn = connection;
    db = database;
    server = mongodbServer;
  });

  afterAll(async () => {
    await conn.close();
    await server.stop();
    db = undefined;
    conn = undefined;
    server = undefined;
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should create and delete connection', async () => {
    const nodeA: NodeInstance = {
      id: 'ida',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeB: NodeInstance = {
      id: 'idb',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'test',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

    const newConn = await createConnection(fromSocket, toSocket, {
      db,
      userId: ''
    });

    expect(newConn.id).toBeDefined();
    expect(newConn.from).toEqual(fromSocket);
    expect(newConn.to).toEqual(toSocket);
    expect(newConn.workspaceId).toBe('123');
    expect(newConn.contextIds).toEqual([]);

    const res = await deleteConnection(newConn.id, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const unknownConn = await getConnection(newConn.id, {
      db,
      userId: ''
    });
    expect(unknownConn).toBe(null);
    expect(updateStates).toHaveBeenCalledTimes(2);
  });

  test('should return null for invalid id', async () => {
    const res = await getConnection('test', {
      db,
      userId: ''
    });
    expect(res).toBe(null);
  });

  test('should throw error for unknown connection', async () => {
    try {
      await tryGetConnection(VALID_OBJECT_ID, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid connection');
    }
  });

  test('should throw error for already existing connection', async () => {
    const nodeA: NodeInstance = {
      id: 'ida',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeB: NodeInstance = {
      id: 'idb',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'test',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB);

    await createConnection(
      { name: 'test', nodeId: nodeA.id },
      { name: 'test', nodeId: nodeB.id },
      {
        db,
        userId: ''
      }
    );

    try {
      await createConnection(
        { name: 'test', nodeId: nodeA.id },
        { name: 'test', nodeId: nodeB.id },
        {
          db,
          userId: ''
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Only one input allowed');
    }
  });

  test('should create connection in context', async () => {
    const node: NodeInstance = {
      id: 'ida',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeAinContext: NodeInstance = {
      id: 'idb-i',
      contextIds: [node.id],
      form: [],
      inputs: [],
      outputs: [],
      type: '123',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeBinContext: NodeInstance = {
      id: 'idb-o',
      contextIds: [node.id],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeAinContext)
      .mockResolvedValueOnce(nodeBinContext);

    const fromSocket: SocketInstance = {
      name: 'val',
      nodeId: nodeAinContext.id
    };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeBinContext.id };

    const newConn = await createConnection(fromSocket, toSocket, {
      db,
      userId: ''
    });

    expect(newConn.id).toBeDefined();
    expect(newConn.from).toEqual(fromSocket);
    expect(newConn.to).toEqual(toSocket);
    expect(newConn.workspaceId).toBe('123');
    expect(newConn.contextIds).toEqual([node.id]);
  });

  test('should error when trying to create invalid connection', async () => {
    try {
      await createConnection(null, null, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid connection');
    }
  });

  test('should find cycle and prevent connection creation', async () => {
    const nodeA: NodeInstance = {
      id: 'ida',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeB: NodeInstance = {
      id: 'idb',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'test',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

    const newConn = await createConnection(fromSocket, toSocket, {
      db,
      userId: ''
    });
    expect(newConn).not.toBe(null);

    try {
      await createConnection(toSocket, fromSocket, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Cyclic dependencies not allowed');
    }
  });

  test('should not create connection for unknown nodes', async () => {
    const nodeA: NodeInstance = {
      id: 'ida',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockImplementationOnce(() => {
        throw new Error('Unknown node');
      });

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: VALID_OBJECT_ID
    };

    try {
      await createConnection(toSocket, fromSocket, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node');
    }
  });

  test('should not create connection for nodes in different workspaces', async () => {
    const nodeA: NodeInstance = {
      id: 'ida',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeB: NodeInstance = {
      id: 'idb',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'test',
      workspaceId: 'otherws',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: nodeB.id
    };

    try {
      await createConnection(toSocket, fromSocket, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Nodes live in different workspaces');
    }
  });

  test('should not create connection for nodes in different contexts', async () => {
    const nodeA: NodeInstance = {
      id: 'ida',
      contextIds: ['id'],
      form: [],
      inputs: [],
      outputs: [],
      type: 'abc',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeB: NodeInstance = {
      id: 'idb',
      contextIds: ['otherid'],
      form: [],
      inputs: [],
      outputs: [],
      type: 'test',
      workspaceId: '123',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: nodeB.id
    };

    try {
      await createConnection(toSocket, fromSocket, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Nodes live in different contexts');
    }
  });

  test('should delete connections with context id', async () => {
    const connectionsCollection = getConnectionsCollection(db);
    await connectionsCollection.insertOne({
      contextIds: ['randomid']
    });
    await connectionsCollection.insertOne({
      contextIds: ['randomid', 'test']
    });
    await connectionsCollection.insertOne({
      contextIds: ['abc', 'randomid', 'test']
    });

    await deleteConnectionsInContext('randomid', {
      db,
      userId: ''
    });

    const count = await connectionsCollection.count({});
    expect(count).toBe(0);
  });
});
