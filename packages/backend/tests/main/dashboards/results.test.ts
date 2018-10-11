import { DataType, NodeOutputResult, Workspace } from '@masterthesis/shared';

import { ObjectID } from 'bson';
import {
  addOrUpdateResult,
  deleteResultById,
  deleteResultByName,
  deleteResultsByWorkspace,
  getPublicResults,
  getResult,
  getResultsForWorkspace,
  setResultVisibility,
  tryGetResult
} from '../../../src/main/dashboards/results';
import {
  getWorkspacesCollection,
  tryGetWorkspace
} from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db;
let server;

jest.mock('../../../src/main/workspace/workspace');

describe('Dashboard Results', () => {
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

  test('should create result', async () => {
    const value: NodeOutputResult<string> = {
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const res = await addOrUpdateResult(value, VALID_OBJECT_ID, {
      db,
      userId: '123'
    });
    expect(res).toBeDefined();

    const all = await getResultsForWorkspace(VALID_OBJECT_ID, {
      db,
      userId: '123'
    });
    expect(all.length).toBe(1);
    expect(all[0].value).toEqual(value.value);
    expect(all[0].workspaceId).toEqual(VALID_OBJECT_ID);
    expect(all[0].type).toEqual(value.type);
    expect(all[0].name).toEqual(value.name);
  });

  test('should throw error for empty names', async () => {
    try {
      await addOrUpdateResult(
        {
          name: '',
          description: 'desc',
          value: '',
          type: DataType.STRING
        },
        VALID_OBJECT_ID,
        { db, userId: '' }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Name must not be empty');
    }
  });

  test('should throw error for unknown workspace', async () => {
    (tryGetWorkspace as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown Workspace');
    });
    try {
      await addOrUpdateResult(
        {
          name: 'test',
          description: 'desc',
          value: '',
          type: DataType.STRING
        },
        VALID_OBJECT_ID,
        { db, userId: '' }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown Workspace');
    }
  });

  test('should update result', async () => {
    const oldValue: NodeOutputResult<string> = {
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };
    const newValue: NodeOutputResult<number> = {
      description: 'new desc',
      name: 'test',
      type: DataType.NUMBER,
      value: 123
    };

    let res = await addOrUpdateResult(oldValue, VALID_OBJECT_ID, {
      db,
      userId: '123'
    });
    expect(res).toBeDefined();

    res = await addOrUpdateResult(newValue, VALID_OBJECT_ID, {
      db,
      userId: '123'
    });
    expect(res).toBeDefined();

    const all = await getResultsForWorkspace(VALID_OBJECT_ID, {
      db,
      userId: '123'
    });
    expect(all.length).toBe(1);
    expect(all[0].value).toEqual(newValue.value);
    expect(all[0].workspaceId).toEqual(VALID_OBJECT_ID);
    expect(all[0].name).toEqual(newValue.name);
    expect(all[0].description).toEqual(newValue.description);
    expect(all[0].type).toEqual(newValue.type);
  });

  test('should get result', async () => {
    const value: NodeOutputResult<string> = {
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, VALID_OBJECT_ID, {
      db,
      userId: ''
    });
    expect(savedRes.id).toBeDefined();

    const res = await getResult(savedRes.id, { db, userId: '' });
    expect(res).toEqual(savedRes);
    expect(res.id).toBeDefined();
  });

  test('should delete result by id', async () => {
    const value: NodeOutputResult<string> = {
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, VALID_OBJECT_ID, {
      db,
      userId: ''
    });
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultById(savedRes.id, { db, userId: '' });
    expect(res).toEqual(true);

    const newRes = await getResult(savedRes.id, { db, userId: '' });
    expect(newRes).toBe(null);
  });

  test('should delete result by workspace id', async () => {
    const value: NodeOutputResult<string> = {
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, VALID_OBJECT_ID, {
      db,
      userId: ''
    });
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultsByWorkspace(VALID_OBJECT_ID, {
      db,
      userId: ''
    });
    expect(res).toEqual(true);

    const newRes = await getResult(savedRes.id, { db, userId: '' });
    expect(newRes).toBe(null);
  });

  test('should return null for unknown results', async () => {
    let res = await getResult('test', { db, userId: '' });
    expect(res).toBe(null);

    res = await getResult(VALID_OBJECT_ID, { db, userId: '' });
    expect(res).toBe(null);
  });

  test('should delete result by name', async () => {
    const value: NodeOutputResult<string> = {
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, VALID_OBJECT_ID, {
      db,
      userId: ''
    });
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultByName(savedRes.name, savedRes.workspaceId, {
      db,
      userId: ''
    });
    expect(res).toEqual(true);

    const newRes = await getResult(savedRes.id, { db, userId: '' });
    expect(newRes).toBe(null);
  });

  test('should throw error for unknown name', async () => {
    try {
      await deleteResultByName('unknown', 'test', { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Deletion of Result failed');
    }
  });

  test('should throw error for unknown id', async () => {
    try {
      await deleteResultById(VALID_OBJECT_ID, { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Deletion of Result failed');
    }
  });

  test('should get only results for correct workspace', async () => {
    const value: NodeOutputResult<string> = {
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };
    const otherValue: NodeOutputResult<string> = {
      description: 'desc 2',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    await Promise.all([
      addOrUpdateResult(value, VALID_OBJECT_ID, { db, userId: '' }),
      addOrUpdateResult(otherValue, 'abc', { db, userId: '' })
    ]);

    const res = await getResultsForWorkspace(VALID_OBJECT_ID, {
      db,
      userId: ''
    });
    expect(res.length).toBe(1);
    expect(res[0].value).toEqual(value.value);
    expect(res[0].id).toBeDefined();
  });

  test('should throw error for unknown result', async () => {
    try {
      await tryGetResult(VALID_OBJECT_ID, { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown Result');
    }
  });

  test('should try and get result', async () => {
    const res = await addOrUpdateResult(
      { name: 'test', value: 9, description: '', type: DataType.NUMBER },
      VALID_OBJECT_ID,
      { db, userId: '' }
    );
    const triedRes = await tryGetResult(res.id, { db, userId: '' });
    expect(res).toEqual(triedRes);
  });

  test('should set result visibility', async () => {
    const newRes = await addOrUpdateResult(
      { name: 'test', value: 9, description: '', type: DataType.NUMBER },
      VALID_OBJECT_ID,
      { db, userId: '' }
    );
    expect(newRes.visible).toBe(false);

    const res = await setResultVisibility(newRes.id, true, {
      db,
      userId: ''
    });
    const triedRes = await tryGetResult(newRes.id, { db, userId: '' });

    expect(res).toEqual(triedRes);
    expect(triedRes.visible).toBe(true);
  });

  test('should get public results', async () => {
    const ws: Workspace & { _id: ObjectID } = {
      _id: new ObjectID(VALID_OBJECT_ID),
      id: VALID_OBJECT_ID,
      userId: '',
      created: '',
      description: '',
      name: 'test',
      lastChange: ''
    };
    (getWorkspacesCollection as jest.Mock).mockImplementation(() => ({
      findOne: jest.fn(() => Promise.resolve(ws))
    }));
    const resultA: NodeOutputResult = {
      name: 'testA',
      description: 'abc',
      type: DataType.STRING,
      value: 'a'
    };
    const resultB: NodeOutputResult = {
      name: 'testB',
      description: 'abc',
      type: DataType.STRING,
      value: 'a'
    };

    const [resAObj] = await Promise.all([
      addOrUpdateResult(resultA, ws.id, { db, userId: '' }),
      addOrUpdateResult(resultB, ws.id, { db, userId: '' })
    ]);
    await setResultVisibility(resAObj.id, true, { db, userId: '' });

    const res = await getPublicResults(ws.id, { db, userId: '' });
    expect(res).toEqual({
      created: '',
      description: '',
      id: VALID_OBJECT_ID,
      lastChange: '',
      name: 'test',
      results: [
        {
          description: 'abc',
          id: expect.any(String),
          name: 'testA',
          type: 'String',
          userId: '',
          value: 'a',
          visible: true,
          workspaceId: VALID_OBJECT_ID
        }
      ],
      userId: ''
    });
  });

  test('should get public results', async () => {
    (getWorkspacesCollection as jest.Mock).mockImplementation(() => ({
      findOne: jest.fn(() => Promise.resolve(null))
    }));

    const res = await getPublicResults(VALID_OBJECT_ID, { db, userId: '' });
    expect(res).toBe(null);
  });
});
