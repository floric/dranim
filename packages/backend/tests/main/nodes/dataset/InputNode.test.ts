import { DatasetInputNodeDef } from '@masterthesis/shared';
import { Db, MongoClient } from 'mongodb';

import { DatasetInputNode } from '../../../../src/main/nodes/dataset/InputNode';
import { createDataset } from '../../../../src/main/workspace/dataset';
import { NeverGoHereError, VALID_OBJECT_ID } from '../../../test-utils';

let connection;
let db: Db;

describe('DatasetInputNode', () => {
  beforeAll(async () => {
    connection = await MongoClient.connect((global as any).__MONGO_URI__);
    db = await connection.db((global as any).__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
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
    expect(res.outputs.dataset).toEqual({ id: newDs.id });
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
