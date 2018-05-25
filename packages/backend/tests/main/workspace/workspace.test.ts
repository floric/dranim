import {
  DatasetOutputNodeDef,
  IOValues,
  JoinDatasetsNodeDef,
  NodeInstance,
  NodeState,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  ProcessState,
  StringInputNodeDef,
  Workspace
} from '@masterthesis/shared';
import { Db, MongoClient } from 'mongodb';
import sleep from 'sleep-promise';

import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  updateWorkspace
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
      const ws = await createWorkspace(db, name, description);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toEqual('Name of workspace must not be empty.');
    }
  });

  test('should not delete unknown workspace', async () => {
    try {
      const ws = await deleteWorkspace(db, 'abc');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toEqual('Invalid ID');
    }
  });

  test('should get all workspaces', async () => {
    const allWs = await Promise.all([
      createWorkspace(db, 'a', 'aDesc'),
      createWorkspace(db, 'b', 'bDesc'),
      createWorkspace(db, 'c', 'cDesc')
    ]);

    const wsA = allWs.filter(n => n.name === 'a');
    expect(wsA.length).toBe(1);
  });

  test('should update only lastChange in workspace', async () => {
    const description = 'desc';
    const name = 'wsname';

    const ws = await createWorkspace(db, name, description);

    const res = await updateWorkspace(db, ws.id, [], []);
    expect(res).toBe(true);

    await sleep(1100);

    const newWs = await getWorkspace(db, ws.id);
    expect(new Date(ws.lastChange).getTime()).toBeLessThan(
      new Date(newWs.lastChange).getTime()
    );
  });
});
