import { DatasetOutputNodeDef, DataType } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { DatasetOutputNode } from '../../../../src/main/nodes/dataset/output';
import { createDataset } from '../../../../src/main/workspace/dataset';
import { getTestMongoDb, NeverGoHereError, NODE } from '../../../test-utils';

let conn;
let db: Db;
let server;

describe('DatasetOutputNode', () => {
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
    expect(DatasetOutputNode.type).toBe(DatasetOutputNodeDef.type);
    expect(DatasetOutputNode.isInputValid).toBeUndefined();
    expect(DatasetOutputNode.isFormValid).toBeUndefined();
    expect(DatasetOutputNodeDef.isOutputNode).toBe(true);
  });

  test('should have invalid dataset', async () => {
    try {
      await DatasetOutputNode.onNodeExecution(
        {},
        { dataset: { datasetId: 'test' } },
        { db, node: NODE }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should have valid dataset', async () => {
    const ds = await createDataset(db, 'test');

    const res = await DatasetOutputNode.onNodeExecution(
      {},
      { dataset: { datasetId: ds.id } },
      { db, node: NODE }
    );

    expect(res.outputs).toBeDefined();
    expect(res.results.dataset.datasetId).toBe(ds.id);
  });

  test('should return absent meta for missing dataset', async () => {
    let res = await DatasetOutputNode.onMetaExecution(
      {},
      { dataset: null },
      db
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DatasetOutputNode.onMetaExecution(
      {},
      { dataset: undefined },
      db
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DatasetOutputNode.onMetaExecution(
      {},
      { dataset: { content: { schema: [] }, isPresent: false } },
      db
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });
  });

  test('should return valid meta for dataset', async () => {
    const inputDef = {
      dataset: {
        isPresent: true,
        content: {
          schema: [
            {
              name: 'test',
              fallback: '',
              required: false,
              unique: true,
              type: DataType.STRING
            }
          ]
        }
      }
    };

    const res = await DatasetOutputNode.onMetaExecution({}, inputDef, db);
    expect(res).toEqual(inputDef);
  });
});
