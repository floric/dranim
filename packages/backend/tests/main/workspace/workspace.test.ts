import {
  NumberInputNodeDef,
  NumberOutputNodeDef,
  sleep
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createConnection } from '../../../src/main/workspace/connections';
import {
  createNode,
  getAllNodes,
  getNode
} from '../../../src/main/workspace/nodes';
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspace,
  initWorkspaceDb,
  updateWorkspace,
  updateLastChange
} from '../../../src/main/workspace/workspace';
import { getTestMongoDb, NeverGoHereError } from '../../test-utils';

let conn;
let db: Db;
let server;

describe('Workspaces', () => {
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

  test('should create and delete workspace', async () => {
    const description = 'desc';
    const name = 'wsname';

    const ws = await createWorkspace(db, name, description);

    expect(ws.id).toBeDefined();
    expect(ws.connections).toBeUndefined();
    expect(ws.created).toBeDefined();
    expect(ws.description).toBe(description);
    expect(ws.name).toEqual(name);
    expect(ws.lastChange).toBeDefined();
    expect(ws.nodes).toBeUndefined();

    const createdWs = await getWorkspace(db, ws.id);
    expect(createdWs).toEqual(ws);

    const res = await deleteWorkspace(db, ws.id);

    expect(res).toBe(true);

    const unknownWs = await getWorkspace(db, ws.id);

    expect(unknownWs).toBe(null);
  });

  test('should not create workspace with empty name', async () => {
    const description = 'desc';
    const name = '';

    try {
      await createWorkspace(db, name, description);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toEqual('Name of workspace must not be empty.');
    }
  });

  test('should not delete unknown workspace', async () => {
    try {
      await deleteWorkspace(db, 'abc');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toEqual('Invalid ID');
    }
  });

  test('should get all workspaces', async () => {
    await Promise.all([
      createWorkspace(db, 'a', 'aDesc'),
      createWorkspace(db, 'b', 'bDesc'),
      createWorkspace(db, 'c', 'cDesc')
    ]);

    const allWs = await getAllWorkspaces(db);

    expect(allWs.length).toBe(3);

    const wsA = allWs.filter(n => n.name === 'a');
    expect(wsA.length).toBe(1);
  });

  test('should update only lastChange in workspace', async () => {
    const description = 'desc';
    const name = 'wsname';

    const ws = await createWorkspace(db, name, description);

    await sleep(100);

    const res = await updateWorkspace(db, ws.id, [], []);
    expect(res).toBe(true);

    const newWs = await getWorkspace(db, ws.id);
    expect(new Date(ws.lastChange).getTime()).toBeLessThan(
      new Date(newWs.lastChange).getTime()
    );
  });

  test('should move nodes with update workspace', async () => {
    const description = 'desc';
    const name = 'wsname';

    const ws = await createWorkspace(db, name, description);
    const [nodeA, nodeB] = await Promise.all([
      createNode(db, NumberInputNodeDef.name, ws.id, [], 0, 0),
      createNode(db, NumberOutputNodeDef.name, ws.id, [], 0, 0)
    ]);
    const nodeConn = await createConnection(
      db,
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id }
    );

    const res = await updateWorkspace(
      db,
      ws.id,
      [{ ...nodeA, x: 1, y: 2 }, { ...nodeB, x: 3, y: 4 }],
      [nodeConn]
    );
    expect(res).toBe(true);

    const [updatedNodeA, updatedNodeB] = await Promise.all([
      getNode(db, nodeA.id),
      getNode(db, nodeB.id)
    ]);
    expect(updatedNodeA.x).toBe(1);
    expect(updatedNodeA.y).toBe(2);
    expect(updatedNodeB.x).toBe(3);
    expect(updatedNodeB.y).toBe(4);
  });

  test('should return true after initializing workspaces', async () => {
    const res = await initWorkspaceDb(db);
    expect(res).toBe(true);
  });

  test('should update last change of workspace', async () => {
    const ws = await createWorkspace(db, 'test', '');

    await sleep(100);
    await updateLastChange(db, ws.id);

    const newWs = await getWorkspace(db, ws.id);
    expect(new Date(newWs.lastChange).getTime()).toBeGreaterThan(
      new Date(ws.lastChange).getTime()
    );
  });
});
