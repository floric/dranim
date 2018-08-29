import { Db } from 'mongodb';

import { Dataset, ProcessState } from '../../../../shared/lib';
import { tryGetDataset } from '../../../src/main/workspace/dataset';
import {
  getAllUploads,
  uploadEntriesCsv
} from '../../../src/main/workspace/upload';
import { getTestMongoDb, VALID_OBJECT_ID } from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/workspace/dataset');
jest.mock('../../../src/main/workspace/entry');

describe('Upload', () => {
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

  test('should get all uploads', async () => {
    const res = await getAllUploads(VALID_OBJECT_ID, { db, userId: '' });
    expect(res).toEqual([]);
  });

  test('should start upload', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'DS',
      created: '',
      description: '',
      valueschemas: [],
      workspaceId: ''
    };
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const res = await uploadEntriesCsv(['test'], VALID_OBJECT_ID, {
      db,
      userId: ''
    });

    const { id, start, ...rest } = res;
    expect(rest).toEqual({
      addedEntries: 0,
      datasetId: VALID_OBJECT_ID,
      errors: [],
      failedEntries: 0,
      fileNames: [],
      invalidEntries: 0,
      state: ProcessState.STARTED
    });
  });
});
