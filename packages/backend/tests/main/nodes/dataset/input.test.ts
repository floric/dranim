import { Dataset, DatasetInputNodeDef, DataType } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { DatasetInputNode } from '../../../../src/main/nodes/dataset/input';
import { processEntries } from '../../../../src/main/nodes/entries/utils';
import {
  getDataset,
  tryGetDataset
} from '../../../../src/main/workspace/dataset';
import { getTestMongoDb, NODE, VALID_OBJECT_ID } from '../../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/nodes/entries/utils');

const ds: Dataset = {
  id: VALID_OBJECT_ID,
  name: 'test',
  valueschemas: [
    {
      name: 'test',
      type: DataType.STRING,
      fallback: '',
      required: true,
      unique: false
    }
  ],
  workspaceId: VALID_OBJECT_ID,
  created: new Date().toISOString(),
  description: ''
};

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
    db = undefined;
    conn = undefined;
    server = undefined;
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
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);
    (processEntries as jest.Mock).mockImplementation(async (a, processFn) =>
      processFn({ values: { test: 'abc' }, id: 'test' })
    );
    const res = await DatasetInputNode.onNodeExecution(
      { dataset: VALID_OBJECT_ID },
      {},
      {
        reqContext: { db, userId: '' },
        node: NODE
      }
    );
    expect(res.outputs.dataset).toEqual({
      entries: [{ test: 'abc' }],
      schema: [
        {
          name: 'test',
          type: DataType.STRING,
          fallback: '',
          required: true,
          unique: false
        }
      ]
    });
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
    let res = await DatasetInputNode.onMetaExecution(
      { dataset: null },
      {},
      { db, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: undefined },
      {},
      { db, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: '' },
      {},
      { db, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await DatasetInputNode.onMetaExecution(
      { dataset: VALID_OBJECT_ID },
      {},
      { db, userId: '' }
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should have valid meta for dataset', async () => {
    (getDataset as jest.Mock).mockResolvedValue(ds);

    const res = await DatasetInputNode.onMetaExecution(
      { dataset: VALID_OBJECT_ID },
      {},
      { db, userId: '' }
    );
    expect(res).toEqual({
      dataset: {
        isPresent: true,
        content: {
          schema: [
            {
              fallback: '',
              name: 'test',
              required: true,
              type: 'String',
              unique: false
            }
          ]
        }
      }
    });
  });
});
