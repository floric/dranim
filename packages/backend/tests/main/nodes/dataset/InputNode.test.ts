import { DatasetInputNodeDef } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { DatasetInputNode } from '../../../../src/main/nodes/dataset/InputNode';
import { createDataset } from '../../../../src/main/workspace/dataset';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../../test-utils';

let conn;
let db: Db;
let server;

describe('DatasetInputNode', () => {
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

  test('should have correct properties', () => {
    expect(DatasetInputNode.name).toBe(DatasetInputNodeDef.name);
    expect(DatasetInputNode.isFormValid).toBeDefined();
    expect(DatasetInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form with valid dataset', async () => {
    const newDs = await createDataset(db, 'testA');

    const res = await DatasetInputNode.onServerExecution(
      { dataset: newDs.id },
      {},
      db
    );
    expect(res.outputs.dataset).toEqual({ datasetId: newDs.id });
  });

  test('should get output value from form', async () => {
    try {
      await DatasetInputNode.onServerExecution(
        { dataset: VALID_OBJECT_ID },
        {},
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should accept form', async () => {
    const res = await DatasetInputNode.isFormValid({ dataset: 'test' });

    expect(res).toBe(true);
  });

  test('should not accept form', async () => {
    const res = await DatasetInputNode.isFormValid({ dataset: null });

    expect(res).toBe(false);
  });
});
