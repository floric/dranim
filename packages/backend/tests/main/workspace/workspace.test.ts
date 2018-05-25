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

import { createNode, deleteNode } from '../../../src/main/workspace/nodes';
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  getWorkspacesCollection,
  updateWorkspace
} from '../../../src/main/workspace/workspace';

let connection;
let db: Db;

describe('Workspaces', () => {
  beforeAll(async () => {
    connection = await MongoClient.connect((global as any).__MONGO_URI__);
    db = await connection.db((global as any).__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
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
      throw new Error('Should fail');
    } catch (err) {
      expect(err.message).toEqual('Name of workspace must not be empty.');
    }
  });

  test('should not delete unknown workspace', async () => {
    try {
      const ws = await deleteWorkspace(db, 'abc');
      throw new Error('Should fail');
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
