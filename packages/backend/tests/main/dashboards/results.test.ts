import { DataType, OutputResult } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { tryGetDashboard } from '../../../src/main/dashboards/dashboards';
import {
  addOrUpdateResult,
  deleteResultById,
  deleteResultByName,
  deleteResultsByDashboard,
  getResult,
  getResultsForDashboard
} from '../../../src/main/dashboards/results';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/dashboards/dashboards');

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
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should create result', async () => {
    const value: OutputResult<string> = {
      dashboardId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const res = await addOrUpdateResult(value, db);
    expect(res).toBeDefined();

    const all = await getResultsForDashboard('abc', db);
    expect(all.length).toBe(1);
    expect(all[0].value).toEqual(JSON.stringify(value.value));
    expect(all[0].dashboardId).toEqual(value.dashboardId);
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
          dashboardId: 'test',
          type: DataType.STRING
        },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Name must not be empty');
    }
  });

  test('should throw error for unknown dashboard', async () => {
    (tryGetDashboard as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown Dashboard');
    });
    try {
      await addOrUpdateResult(
        {
          name: 'test',
          description: 'desc',
          value: '',
          dashboardId: 'test',
          type: DataType.STRING
        },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown Dashboard');
    }
  });

  test('should update result', async () => {
    const oldValue: OutputResult<string> = {
      dashboardId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };
    const newValue: OutputResult<number> = {
      dashboardId: 'abc',
      description: 'new desc',
      name: 'test',
      type: DataType.NUMBER,
      value: 123
    };

    let res = await addOrUpdateResult(oldValue, db);
    expect(res).toBeDefined();

    res = await addOrUpdateResult(newValue, db);
    expect(res).toBeDefined();

    const all = await getResultsForDashboard('abc', db);
    expect(all.length).toBe(1);
    expect(all[0].value).toEqual(JSON.stringify(newValue.value));
    expect(all[0].dashboardId).toEqual(newValue.dashboardId);
    expect(all[0].type).toEqual(newValue.type);
    expect(all[0].name).toEqual(newValue.name);
  });

  test('should get result', async () => {
    const value: OutputResult<string> = {
      dashboardId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, db);
    expect(savedRes.id).toBeDefined();

    const res = await getResult(savedRes.id, db);
    expect(res).toEqual(savedRes);
    expect(res.id).toBeDefined();
  });

  test('should delete result by id', async () => {
    const value: OutputResult<string> = {
      dashboardId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, db);
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultById(savedRes.id, db);
    expect(res).toEqual(true);

    const newRes = await getResult(savedRes.id, db);
    expect(newRes).toBe(null);
  });

  test('should delete result by dashboard id', async () => {
    const value: OutputResult<string> = {
      dashboardId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, db);
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultsByDashboard('abc', db);
    expect(res).toEqual(true);

    const newRes = await getResult(savedRes.id, db);
    expect(newRes).toBe(null);
  });

  test('should return null for unknown dashboards', async () => {
    let res = await getResult('test', db);
    expect(res).toBe(null);

    res = await getResult(VALID_OBJECT_ID, db);
    expect(res).toBe(null);
  });

  test('should delete result by name', async () => {
    const value: OutputResult<string> = {
      dashboardId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    const savedRes = await addOrUpdateResult(value, db);
    expect(savedRes.id).toBeDefined();

    const res = await deleteResultByName(
      savedRes.name,
      savedRes.dashboardId,
      db
    );
    expect(res).toEqual(true);

    const newRes = await getResult(savedRes.id, db);
    expect(newRes).toBe(null);
  });

  test('should throw error for unknown name', async () => {
    try {
      await deleteResultByName('unknown', 'test', db);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Deletion of Result failed');
    }
  });

  test('should throw error for unknown id', async () => {
    try {
      await deleteResultById(VALID_OBJECT_ID, db);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Deletion of Result failed');
    }
  });

  test('should get only results for correct dashboard', async () => {
    const value: OutputResult<string> = {
      dashboardId: 'abc',
      description: 'desc',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };
    const otherValue: OutputResult<string> = {
      dashboardId: 'otherDb',
      description: 'desc 2',
      name: 'test',
      type: DataType.STRING,
      value: 'val'
    };

    await Promise.all([
      addOrUpdateResult(value, db),
      addOrUpdateResult(otherValue, db)
    ]);

    const res = await getResultsForDashboard(value.dashboardId, db);
    expect(res.length).toBe(1);
    expect(res[0].value).toEqual(JSON.stringify(value.value));
    expect(res[0].id).toBeDefined();
  });
});
