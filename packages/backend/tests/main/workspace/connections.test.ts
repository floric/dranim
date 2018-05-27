import {
  NumberInputNodeDef,
  NumberOutputNodeDef,
  SocketInstance
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  createConnection,
  deleteConnection,
  getConnection
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

    const nodeA = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);
    const nodeB = await createNode(db, NumberOutputNodeDef.name, ws.id, 0, 0);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

    const newConn = await createConnection(db, fromSocket, toSocket);

    expect(newConn.id).toBeDefined();
    expect(newConn.from).toEqual(fromSocket);
    expect(newConn.to).toEqual(toSocket);
    expect(newConn.workspaceId).toBe(ws.id);

    const res = await deleteConnection(db, newConn.id);
    expect(res).toBe(true);

    const unknownConn = await getConnection(db, newConn.id);
    expect(unknownConn).toBe(null);
  });

  test('should find cycle and prevent connection creation', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const nodeA = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);
    const nodeB = await createNode(db, NumberOutputNodeDef.name, ws.id, 0, 0);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

    const newConn = await createConnection(db, fromSocket, toSocket);
    expect(newConn).not.toBe(null);

    try {
      await createConnection(db, toSocket, fromSocket);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Cyclic dependencies not allowed!');
    }
  });

  test('should not create connection for unknown nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const nodeA = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: VALID_OBJECT_ID
    };

    try {
      await createConnection(db, toSocket, fromSocket);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node!');
    }
  });

  test('should not create connection for nodes in different workspaces', async () => {
    const wsA = await createWorkspace(db, 'test', '');
    const wsB = await createWorkspace(db, 'test', '');

    const nodeA = await createNode(db, NumberInputNodeDef.name, wsA.id, 0, 0);
    const nodeB = await createNode(db, NumberInputNodeDef.name, wsB.id, 0, 0);

    const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
    const toSocket: SocketInstance = {
      name: 'val',
      nodeId: nodeB.id
    };

    try {
      await createConnection(db, toSocket, fromSocket);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Nodes live in different workspaes!');
    }
  });
});
