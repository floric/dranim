import { Db } from 'mongodb';

import {
  createDashboard,
  deleteDashboard,
  getAllDashboards,
  getDashboard,
  tryGetDashboard
} from '../../../src/main/dashboards/dashboards';
import { deleteResultsByDashboard } from '../../../src/main/dashboards/results';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/dashboards/results');

describe('Dashboard', () => {
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

  test('should create dashboard', async () => {
    const res = await createDashboard('test', { db, userId: '' });
    expect(res.name).toBe('test');
    expect(res.id).toBeDefined();
  });

  test('should throw error for empty name', async () => {
    try {
      await createDashboard('', { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Name must not be empty');
    }
  });

  test('should throw error for already used name', async () => {
    await createDashboard('test', { db, userId: '' });

    try {
      await createDashboard('test', { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Names must be unique');
    }
  });

  test('should create, get and delete dashboard', async () => {
    const createdDb = await createDashboard('test', { db, userId: '' });
    const getDb = await getDashboard(createdDb.id, { db, userId: '' });
    const tryGetDb = await tryGetDashboard(createdDb.id, { db, userId: '' });

    expect(createdDb).toEqual(getDb);
    expect(createdDb).toEqual(tryGetDb);

    const res = await deleteDashboard(createdDb.id, { db, userId: '' });
    expect(res).toBe(true);

    expect(deleteResultsByDashboard as jest.Mock).toHaveBeenCalledWith(
      createdDb.id,
      { db, userId: '' }
    );
  });

  test('should return null for unknown dashboard', async () => {
    let res = await getDashboard('bla', { db, userId: '' });
    expect(res).toBe(null);

    res = await getDashboard(VALID_OBJECT_ID, { db, userId: '' });
    expect(res).toBe(null);
  });

  test('should throw error for unknown dashboard', async () => {
    try {
      await tryGetDashboard('unknown', { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dashboard');
    }
  });

  test('should get all dashboards', async () => {
    await Promise.all(
      ['abc', 'test', '123'].map(name =>
        createDashboard(name, { db, userId: '' })
      )
    );

    const all = await getAllDashboards({ db, userId: '' });
    expect(all.length).toBe(3);
    expect(all.map(n => n.name)).toContain('abc');
  });
});
