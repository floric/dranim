import { DatasetOutputNodeDef, DataType } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { DatasetOutputNode } from '../../../../src/main/nodes/dataset/output';
import { createDataset } from '../../../../src/main/workspace/dataset';
import { getTestMongoDb, NODE } from '../../../test-utils';

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
    db = undefined;
    conn = undefined;
    server = undefined;
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should have correct properties', () => {
    expect(DatasetOutputNode.type).toBe(DatasetOutputNodeDef.type);
    expect(DatasetOutputNode.isInputValid).toBeUndefined();
    expect(DatasetOutputNode.isFormValid).toBeDefined();
    expect(DatasetOutputNodeDef.isOutputNode).toBe(true);
  });

  test('should have valid dataset', async () => {
    const ds = await createDataset('test', { db, userId: '' });

    const res = await DatasetOutputNode.onNodeExecution(
      { name: 'DS Name', description: '' },
      { dataset: { datasetId: ds.id } },
      {
        reqContext: { db, userId: '' },
        node: NODE
      }
    );

    expect(res.outputs).toBeDefined();
    expect(res.results.value.id).toBe(ds.id);
    expect(res.results.value.name).toBe('DS Name');
  });

  test('should return empty meta for dataset', async () => {
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

    const res = await DatasetOutputNode.onMetaExecution(
      { description: '', name: '' },
      inputDef,
      {
        db,
        userId: ''
      }
    );
    expect(res).toEqual({});
  });
});
