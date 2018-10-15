import { createBirthdaysDemoData } from '../../src/examples/birthdays';
import { getTestMongoDb } from '../test-utils';

let conn;
let db;
let server;

describe('Birthdays Example', () => {
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

  test('should pass through', async () => {
    const res = await createBirthdaysDemoData({ db, userId: '' });
    expect(res).toBe(true);
  });
});
