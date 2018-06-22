import { Dataset, DataType, SelectValuesNodeDef } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../../../src/main/calculation/utils';
import { SelectValuesNode } from '../../../../src/main/nodes/entries/select-values';
import { processEntries } from '../../../../src/main/nodes/entries/utils';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import {
  getTestMongoDb,
  NeverGoHereError,
  NODE,
  VALID_OBJECT_ID
} from '../../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('@masterthesis/shared');
jest.mock('../../../../src/main/nodes/entries/utils');
jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/calculation/utils');

describe('SelectValuesNode', () => {
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
    expect(SelectValuesNode.type).toBe(SelectValuesNodeDef.type);
    expect(SelectValuesNode.isFormValid).toBeDefined();
    expect(SelectValuesNode.isInputValid).toBeUndefined();
  });

  test('should validate form', async () => {
    let res = await SelectValuesNode.isFormValid({ values: [] });
    expect(res).toBe(false);

    res = await SelectValuesNode.isFormValid({ values: null });
    expect(res).toBe(false);

    res = await SelectValuesNode.isFormValid({ values: ['test'] });
    expect(res).toBe(true);
  });

  test('should select values from dataset and create new', async () => {
    const oldDs: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: ['name', 'test', 'abc'].map(n => ({
        type: DataType.STRING,
        name: n,
        required: true,
        fallback: '',
        unique: false
      })),
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'ABC',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    (createDynamicDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (processEntries as jest.Mock).mockImplementation(n => Promise.resolve());
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    const res = await SelectValuesNode.onNodeExecution(
      { values: ['test'] },
      { dataset: { datasetId: oldDs.id } },
      {
        db,
        node: NODE
      }
    );
    expect(res.outputs.dataset.datasetId).toBeDefined();
  });

  test('should throw error for unknown specified value names', async () => {
    const oldDs: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'ABC',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    (createDynamicDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (processEntries as jest.Mock).mockImplementation(n => Promise.resolve());
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    try {
      await SelectValuesNode.onNodeExecution(
        { values: ['bla', 'test'] },
        { dataset: { datasetId: oldDs.id } },
        {
          db,
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown value specified');
    }
  });

  test('should copy all entries but only with selected values', async () => {
    const oldDs: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: ['name', 'test', 'abc'].map(n => ({
        type: DataType.STRING,
        name: n,
        required: true,
        fallback: '',
        unique: false
      })),
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'ABC',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    (createDynamicDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (processEntries as jest.Mock).mockImplementation(n => Promise.resolve());
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    const res = await SelectValuesNode.onNodeExecution(
      { values: ['test', 'abc'] },
      { dataset: { datasetId: oldDs.id } },
      {
        db,
        node: NODE
      }
    );
    expect(res.outputs.dataset.datasetId).toBeDefined();
  });

  test('should return absent meta if dataset is missing', async () => {
    let res = await SelectValuesNode.onMetaExecution(
      { values: ['test', 'abc'] },
      { dataset: null },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await SelectValuesNode.onMetaExecution(
      { values: ['test', 'abc'] },
      { dataset: undefined },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await SelectValuesNode.onMetaExecution(
      { values: ['test', 'abc'] },
      { dataset: { content: { schema: [] }, isPresent: false } },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should return absent meta if values are empty', async () => {
    const res = await SelectValuesNode.onMetaExecution(
      { values: [] },
      { dataset: { content: { schema: [] }, isPresent: true } },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should return filtered meta data', async () => {
    const res = await SelectValuesNode.onMetaExecution(
      { values: ['a', 'b'] },
      {
        dataset: {
          content: {
            schema: [
              {
                name: 'a',
                type: DataType.STRING,
                unique: false,
                required: false,
                fallback: ''
              },
              {
                name: 'b',
                type: DataType.STRING,
                unique: false,
                required: false,
                fallback: ''
              },
              {
                name: 'c',
                type: DataType.STRING,
                unique: false,
                required: false,
                fallback: ''
              },
              {
                name: 'd',
                type: DataType.STRING,
                unique: false,
                required: false,
                fallback: ''
              }
            ]
          },
          isPresent: true
        }
      },
      db
    );
    expect(res).toEqual({
      dataset: {
        isPresent: true,
        content: {
          schema: [
            {
              name: 'a',
              type: DataType.STRING,
              unique: false,
              required: false,
              fallback: ''
            },
            {
              name: 'b',
              type: DataType.STRING,
              unique: false,
              required: false,
              fallback: ''
            }
          ]
        }
      }
    });
  });
});
