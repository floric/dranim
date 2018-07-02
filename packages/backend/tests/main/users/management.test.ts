import { Db } from 'mongodb';

import {
  login,
  register,
  tryGetUser
} from '../../../src/main/users/management';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

describe('Users Management', () => {
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

  test('should register user, login and logout', async () => {
    const registerRes = await register(
      'Florian',
      'Richter',
      'flo@flo.de',
      '123',
      { db, userId: '' }
    );
    expect(registerRes.firstName).toBe('Florian');
    expect(registerRes.lastName).toBe('Richter');
    expect(registerRes.mail).toBe('flo@flo.de');
    expect(registerRes.id).toBeDefined();

    const loginRes = await login('flo@flo.de', '123', { db, userId: '' });
    expect(registerRes).toEqual(loginRes);
  });

  test('should not login with incorrect email', async () => {
    await register('Florian', 'Richter', 'flo@flo.de', '123', {
      db,
      userId: ''
    });

    const loginRes = await login('abc@flo.de', '123', { db, userId: '' });
    expect(loginRes).toBe(null);
  });

  test('should not login with incorrect pw', async () => {
    await register('Florian', 'Richter', 'flo@flo.de', '123', {
      db,
      userId: ''
    });

    const loginRes = await login('flo@flo.de', '456', { db, userId: '' });
    expect(loginRes).toBe(null);
  });

  test('should not register user with same mail', async () => {
    try {
      await register('Florian', 'Richter', 'flo@flo.de', '123', {
        db,
        userId: ''
      });
      await register('Florian', 'Richter', 'flo@flo.de', '123', {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.code).toBe(11000);
    }
  });

  test('should get user', async () => {
    const { id } = await register('Florian', 'Richter', 'flo@flo.de', '123', {
      db,
      userId: ''
    });

    const user = await tryGetUser({ db, userId: id });
    expect(user.id).toBe(id);
    expect(user.firstName).toBe('Florian');
    expect(user.lastName).toBe('Richter');
    expect(user.mail).toBe('flo@flo.de');
  });

  test('should throw error for unknown user', async () => {
    try {
      await tryGetUser({ db, userId: VALID_OBJECT_ID });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown user');
    }

    try {
      await tryGetUser({ db, userId: '123' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown user');
    }
  });
});
