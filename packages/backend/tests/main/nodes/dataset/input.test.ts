import { DatasetInputNodeDef } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { DatasetInputNode } from '../../../../src/main/nodes/dataset/input';
import { createDataset } from '../../../../src/main/workspace/dataset';
import {
  getTestMongoDb,
  NeverGoHereError,
  NODE,
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
    expect(DatasetInputNode.type).toBe(DatasetInputNodeDef.type);
    expect(DatasetInputNode.isFormValid).toBeDefined();
    expect(DatasetInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form with valid dataset', async () => {
    const newDs = await createDataset(db, 'testA');

    const res = await DatasetInputNode.onNodeExecution(
      { dataset: newDs.id },
      {},
      { db, node: NODE }
    );
    expect(res.outputs.dataset).toEqual({ datasetId: newDs.id });
  });

  test('should accept form', async () => {
    const res = await DatasetInputNode.isFormValid({ dataset: 'test' });

    expect(res).toBe(true);
  });

  test('should not accept form', async () => {
    const res = await DatasetInputNode.isFormValid({ dataset: null });

    expect(res).toBe(false);
  });

  test('should have absent meta for missing dataset', async () => {
    let res = await DatasetInputNode.onMetaExecution({ dataset: null }, {}, db);
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: undefined },
      {},
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution({ dataset: '' }, {}, db);
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: VALID_OBJECT_ID },
      {},
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should have valid meta for dataset', async () => {
    const ds = await createDataset(db, 'test');

    const res = await DatasetInputNode.onMetaExecution(
      { dataset: ds.id },
      {},
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: true, content: { schema: [] } }
    });
  });
});
