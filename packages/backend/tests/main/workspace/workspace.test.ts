import { NodeInstance, NodeState, sleep } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getConnectionsCollection } from '../../../src/main/workspace/connections';
import { getNodesCollection } from '../../../src/main/workspace/nodes';
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspace,
  initWorkspaceDb,
  tryGetWorkspace,
  updateLastChange,
  updateWorkspace
} from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/connections');

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
    db = undefined;
    conn = undefined;
    server = undefined;
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should create and delete workspace', async () => {
    (getNodesCollection as jest.Mock).mockReturnValue({
      deleteMany: jest.fn()
    });
    (getConnectionsCollection as jest.Mock).mockReturnValue({
      deleteMany: jest.fn()
    });

    const description = 'desc';
    const name = 'wsname';

    const ws = await createWorkspace(
      name,
      {
        db,
        userId: ''
      },
      description
    );

    expect(ws.id).toBeDefined();
    expect(ws.created).toBeDefined();
    expect(ws.description).toBe(description);
    expect(ws.name).toEqual(name);
    expect(ws.lastChange).toBeDefined();

    const createdWs = await getWorkspace(ws.id, {
      db,
      userId: ''
    });
    expect(createdWs).toEqual(ws);

    const res = await deleteWorkspace(ws.id, {
      db,
      userId: ''
    });

    expect(res).toBe(true);

    const unknownWs = await getWorkspace(ws.id, {
      db,
      userId: ''
    });

    expect(unknownWs).toBe(null);

    expect(getNodesCollection(db).deleteMany).toHaveBeenCalledTimes(1);
    expect(getConnectionsCollection(db).deleteMany).toHaveBeenCalledTimes(1);
  });

  test('should throw error when trying to get unknown workspace', async () => {
    try {
      await tryGetWorkspace('test', { db, userId: '123' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown workspace');
    }
  });

  test('should try to get unknown workspace', async () => {
    const ws = await createWorkspace(
      'test',
      {
        db,
        userId: ''
      },
      ''
    );

    const res = await tryGetWorkspace(ws.id, { db, userId: '123' });
    expect(res).toEqual(ws);
  });

  test('should not create workspace with empty name', async () => {
    const description = 'desc';
    const name = '';

    try {
      await createWorkspace(
        name,
        {
          db,
          userId: ''
        },
        description
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toEqual('Name of workspace must not be empty.');
    }
  });

  test('should not delete unknown workspace', async () => {
    try {
      await deleteWorkspace('abc', {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toEqual('Invalid ID');
    }
  });

  test('should get all workspaces', async () => {
    await Promise.all([
      createWorkspace(
        'a',
        {
          db,
          userId: ''
        },
        'aDesc'
      ),
      createWorkspace(
        'b',
        {
          db,
          userId: ''
        },
        'bDesc'
      ),
      createWorkspace(
        'c',
        {
          db,
          userId: ''
        },
        'cDesc'
      )
    ]);

    const allWs = await getAllWorkspaces({
      db,
      userId: ''
    });

    expect(allWs.length).toBe(3);

    const wsA = allWs.filter(n => n.name === 'a');
    expect(wsA.length).toBe(1);
  });

  test('should update only lastChange in workspace', async () => {
    const description = 'desc';
    const name = 'wsname';

    const ws = await createWorkspace(
      name,
      {
        db,
        userId: ''
      },
      description
    );

    await sleep(100);

    const res = await updateWorkspace(ws.id, [], [], {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const newWs = await getWorkspace(ws.id, {
      db,
      userId: ''
    });
    expect(new Date(ws.lastChange).getTime()).toBeLessThan(
      new Date(newWs.lastChange).getTime()
    );
  });

  test('should throw error when updating workspaces with invalid id', async () => {
    try {
      await updateWorkspace('test', [], [], {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid ID');
    }
  });

  test('should move nodes with update workspace', async () => {
    (getNodesCollection as jest.Mock).mockReturnValue({
      updateOne: jest.fn()
    });
    (getConnectionsCollection as jest.Mock).mockReturnValue({
      updateOne: jest.fn()
    });
    const description = 'desc';
    const name = 'wsname';

    const ws = await createWorkspace(
      name,
      {
        db,
        userId: ''
      },
      description
    );

    const nodeA: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'a',
      x: 0,
      y: 0,
      workspaceId: ws.id,
      state: NodeState.VALID,
      variables: {}
    };
    const nodeB: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'a',
      x: 0,
      y: 0,
      workspaceId: ws.id,
      state: NodeState.VALID,
      variables: {}
    };

    const res = await updateWorkspace(
      ws.id,
      [{ ...nodeA, x: 1, y: 2 }, { ...nodeB, x: 3, y: 4 }],
      [
        {
          workspaceId: ws.id,
          contextIds: [],
          from: { name: 'val', nodeId: nodeA.id },
          to: { name: 'val', nodeId: nodeB.id },
          id: VALID_OBJECT_ID
        }
      ],
      {
        db,
        userId: ''
      }
    );
    expect(res).toBe(true);

    expect(getConnectionsCollection(db).updateOne).toHaveBeenCalledTimes(1);
    expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(2);
  });

  test('should return true after initializing workspaces', async () => {
    (getNodesCollection as jest.Mock).mockReturnValue({
      createIndex: jest.fn()
    });
    (getConnectionsCollection as jest.Mock).mockReturnValue({
      createIndex: jest.fn()
    });

    const res = await initWorkspaceDb(db);
    expect(res).toBe(true);

    expect(getConnectionsCollection(db).createIndex).toHaveBeenCalledTimes(1);
    expect(getNodesCollection(db).createIndex).toHaveBeenCalledTimes(1);
  });

  test('should update last change of workspace', async () => {
    const ws = await createWorkspace(
      'test',
      {
        db,
        userId: ''
      },
      ''
    );

    await sleep(100);
    await updateLastChange(ws.id, {
      db,
      userId: ''
    });

    const newWs = await getWorkspace(ws.id, {
      db,
      userId: ''
    });
    expect(new Date(newWs.lastChange).getTime()).toBeGreaterThan(
      new Date(ws.lastChange).getTime()
    );
  });
});
