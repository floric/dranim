import { connectToDb } from '../src/config/db';
import { main } from '../src/main';
import { getConnectionsCollection } from '../src/main/workspace/connections';
import { getDatasetsCollection } from '../src/main/workspace/dataset';
import { getNodesCollection } from '../src/main/workspace/nodes';
import { getWorkspacesCollection } from '../src/main/workspace/workspace';
import { getTestMongoDb } from './test-utils';

let conn;
let db;
let server;

jest.mock('../src/main/workspace/nodes');
jest.mock('../src/main/workspace/connections');
jest.mock('../src/main/workspace/dataset');
jest.mock('../src/main/workspace/workspace');
jest.mock('../src/config/db');

describe('Main', () => {
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

  test('should initialize collection indices', async () => {
    jest.setTimeout(10000);

    (getNodesCollection as jest.Mock).mockReturnValue({
      createIndex: jest.fn()
    });
    (getConnectionsCollection as jest.Mock).mockReturnValue({
      createIndex: jest.fn()
    });
    (getWorkspacesCollection as jest.Mock).mockReturnValue({
      createIndex: jest.fn()
    });
    (getDatasetsCollection as jest.Mock).mockReturnValue({
      createIndex: jest.fn()
    });
    (connectToDb as jest.Mock).mockResolvedValue({
      db: () => db
    });

    await main({ frontendDomain: '', port: 1234 });

    expect(
      getConnectionsCollection(expect.anything()).createIndex
    ).toHaveBeenCalledTimes(1);
    expect(
      getNodesCollection(expect.anything()).createIndex
    ).toHaveBeenCalledTimes(1);
    expect(
      getWorkspacesCollection(expect.anything()).createIndex
    ).toHaveBeenCalledTimes(1);
    expect(
      getDatasetsCollection(expect.anything()).createIndex
    ).toHaveBeenCalledTimes(1);
  });
});
