import {
  NumberInputNodeDef,
  NumberOutputNodeDef,
  SocketInstance,
  SumNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  createConnection,
  deleteConnection,
  getConnection,
  tryGetConnection
} from '../../../src/main/workspace/connections';
import { createNode } from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

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
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should create and delete connection', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      NumberOutputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

    const newConn = await createConnection(db, fromSocket, toSocket);

    expect(newConn.id).toBeDefined();
    expect(newConn.from).toEqual(fromSocket);
    expect(newConn.to).toEqual(toSocket);
    expect(newConn.workspaceId).toBe(ws.id);
    expect(newConn.contextIds).toEqual([]);

    const res = await deleteConnection(db, newConn.id);
    expect(res).toBe(true);

    const unknownConn = await getConnection(newConn.id, db);
    expect(unknownConn).toBe(null);
  });

  test('should return null for invalid id', async () => {
    const res = await getConnection('test', db);
    expect(res).toBe(null);
  });

  test('should throw error for unknown connection', async () => {
    try {
      await tryGetConnection(VALID_OBJECT_ID, db);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid connection');
    }
  });

  test('should create connection in context', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const contextNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      SumNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0
    );

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

    const newConn = await createConnection(db, fromSocket, toSocket);

    expect(newConn.id).toBeDefined();
    expect(newConn.from).toEqual(fromSocket);
    expect(newConn.to).toEqual(toSocket);
    expect(newConn.workspaceId).toBe(ws.id);
    expect(newConn.contextIds).toEqual([contextNode.id]);
  });

  test('should error when trying to create invalid connection', async () => {
    try {
      await createConnection(db, null, null);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid connection');
    }
  });

  test('should find cycle and prevent connection creation', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      NumberOutputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

    const newConn = await createConnection(db, fromSocket, toSocket);
    expect(newConn).not.toBe(null);

    try {
      await createConnection(db, toSocket, fromSocket);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Cyclic dependencies not allowed');
    }
  });

  test('should not create connection for unknown nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: VALID_OBJECT_ID
    };

    try {
      await createConnection(db, toSocket, fromSocket);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node');
    }
  });

  test('should not create connection for nodes in different workspaces', async () => {
    const wsA = await createWorkspace(db, 'test', '');
    const wsB = await createWorkspace(db, 'test', '');

    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      wsA.id,
      [],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      NumberInputNodeDef.type,
      wsB.id,
      [],
      0,
      0
    );

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: nodeB.id
    };

    try {
      await createConnection(db, toSocket, fromSocket);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Nodes live in different workspaces');
    }
  });

  test('should not create connection for nodes in different contexts', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const contextNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0
    );

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: nodeB.id
    };

    try {
      await createConnection(db, toSocket, fromSocket);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Nodes live in different contexts');
    }
  });
});
