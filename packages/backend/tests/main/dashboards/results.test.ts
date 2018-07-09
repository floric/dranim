import { DataType, OutputResult } from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  addOrUpdateResult,
  deleteResultById,
  deleteResultByName,
  deleteResultsByWorkspace,
  getResult,
  getResultsForWorkspace
} from '../../../src/main/dashboards/results';
import { tryGetWorkspace } from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
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
    const value: OutputResult<string> = {
      workspaceId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const res = await addOrUpdateResult(value, { db, userId: '' });
    expect(res).toBeDefined();

    const all = await getResultsForWorkspace('abc', { db, userId: '' });
    expect(all.length).toBe(1);
    expect(all[0].value).toEqual(JSON.stringify(value.value));
    expect(all[0].workspaceId).toEqual(value.workspaceId);
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
          workspaceId: 'test',
          type: DataType.STRING
        },
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
          workspaceId: 'test',
          type: DataType.STRING
        },
        { db, userId: '' }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown Workspace');
    }
  });

  test('should update result', async () => {
    const oldValue: OutputResult<string> = {
      workspaceId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };
    const newValue: OutputResult<number> = {
      workspaceId: 'abc',
      description: 'new desc',
      name: 'test',
      type: DataType.NUMBER,
      value: 123
    };

    let res = await addOrUpdateResult(oldValue, { db, userId: '123' });
    expect(res).toBeDefined();

    res = await addOrUpdateResult(newValue, { db, userId: '123' });
    expect(res).toBeDefined();

    const all = await getResultsForWorkspace('abc', { db, userId: '123' });
    expect(all.length).toBe(1);
    expect(all[0].value).toEqual(JSON.stringify(newValue.value));
    expect(all[0].workspaceId).toEqual(newValue.workspaceId);
    expect(all[0].type).toEqual(newValue.type);
    expect(all[0].name).toEqual(newValue.name);
  });

  test('should get result', async () => {
    const value: OutputResult<string> = {
      workspaceId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, { db, userId: '' });
    expect(savedRes.id).toBeDefined();

    const res = await getResult(savedRes.id, { db, userId: '' });
    expect(res).toEqual(savedRes);
    expect(res.id).toBeDefined();
  });

  test('should delete result by id', async () => {
    const value: OutputResult<string> = {
      workspaceId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, { db, userId: '' });
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultById(savedRes.id, { db, userId: '' });
    expect(res).toEqual(true);

    const newRes = await getResult(savedRes.id, { db, userId: '' });
    expect(newRes).toBe(null);
  });

  test('should delete result by workspace id', async () => {
    const value: OutputResult<string> = {
      workspaceId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, { db, userId: '' });
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultsByWorkspace('abc', { db, userId: '' });
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
    const value: OutputResult<string> = {
      workspaceId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, { db, userId: '' });
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
    const value: OutputResult<string> = {
      workspaceId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };
    const otherValue: OutputResult<string> = {
      workspaceId: 'otherDb',
      description: 'desc 2',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    await Promise.all([
      addOrUpdateResult(value, { db, userId: '' }),
      addOrUpdateResult(otherValue, { db, userId: '' })
    ]);

    const res = await getResultsForWorkspace(value.workspaceId, {
      db,
      userId: ''
    });
    expect(res.length).toBe(1);
    expect(res[0].value).toEqual(JSON.stringify(value.value));
    expect(res[0].id).toBeDefined();
  });
});
