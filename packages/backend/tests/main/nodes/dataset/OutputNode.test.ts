import { DatasetOutputNodeDef } from '@masterthesis/shared';
import { Db, MongoClient } from 'mongodb';

import { DatasetOutputNode } from '../../../../src/main/nodes/dataset/OutputNode';
import { createDataset } from '../../../../src/main/workspace/dataset';
import { NeverGoHereError } from '../../../test-utils';

let connection;
let db: Db;

describe('DatasetOutputNode', () => {
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
    expect(DatasetOutputNode.name).toBe(DatasetOutputNodeDef.name);
    expect(DatasetOutputNode.isInputValid).toBeDefined();
    expect(DatasetOutputNode.isFormValid).toBeUndefined();
  });
  
  test("should have valid input", async () => {
    const validInput = await DatasetOutputNode.isInputValid({dataset: {id: "test"}})

    expect(validInput).toBe(true);
  })

  test("should have invalid inputs", async () => {
    let isValid = await DatasetOutputNode.isInputValid({dataset: {id: null}})

    expect(isValid).toBe(false);

    isValid = await DatasetOutputNode.isInputValid({dataset: null})

    expect(isValid).toBe(false);
  })

  test('should have invalid dataset', async () => {
    try {
      await DatasetOutputNode.onServerExecution(
        { },
        { dataset: {id: "test"}},
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should have valid dataset', async () => {
    const ds = await createDataset(db, "test");

    const res = await DatasetOutputNode.onServerExecution(
      { },
      { dataset: {id: ds.id}},
      db
    );

    expect(res.outputs).toBeDefined();
    expect(res.results.dataset.id).toBe(ds.id);
  });
});
