import {
  allAreDefinedAndPresent,
  Dataset,
  DataType,
  Entry,
  JoinDatasetsNodeDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../../../src/main/calculation/utils';
import { JoinDatasetsNode } from '../../../../src/main/nodes/dataset/join-datasets';
import { processEntries } from '../../../../src/main/nodes/entries/utils';
import {
  addValueSchema,
  createDataset,
  tryGetDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getEntryCollection
} from '../../../../src/main/workspace/entry';
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
jest.mock('../../../../src/main/workspace/entry');
jest.mock('../../../../src/main/calculation/utils');

describe('JoinDatasetsNode', () => {
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
    expect(JoinDatasetsNode.type).toBe(JoinDatasetsNodeDef.type);
    expect(JoinDatasetsNode.isFormValid).toBeDefined();
    expect(JoinDatasetsNode.isInputValid).toBeUndefined();
  });

  test('should validate form', async () => {
    let res = await JoinDatasetsNode.isFormValid({
      valueA: '',
      valueB: 'test'
    });
    expect(res).toBe(false);

    res = await JoinDatasetsNode.isFormValid({ valueA: null, valueB: 'test' });
    expect(res).toBe(false);

    res = await JoinDatasetsNode.isFormValid({ valueA: 'test', valueB: 'ca' });
    expect(res).toBe(true);

    res = await JoinDatasetsNode.isFormValid({
      valueA: 'test',
      valueB: 'test'
    });
    expect(res).toBe(true);
  });

  test('should stop for not found schemas', async () => {
    const dsA: Dataset = {
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
    const dsB: Dataset = {
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
    (tryGetDataset as jest.Mock)
      .mockResolvedValueOnce(dsA)
      .mockResolvedValueOnce(dsB);

    try {
      await JoinDatasetsNode.onNodeExecution(
        { valueA: 'TEST', valueB: 'else' },
        { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
        {
          db,
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schema not found');
    }
  });

  test('should throw error for unequal datatypes of values', async () => {
    const dsA: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [
        {
          name: 'colA',
          unique: true,
          fallback: '',
          type: DataType.STRING,
          required: true
        }
      ],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const dsB: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [
        {
          name: 'colB',
          unique: true,
          fallback: '',
          type: DataType.NUMBER,
          required: true
        }
      ],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    (tryGetDataset as jest.Mock)
      .mockResolvedValueOnce(dsA)
      .mockResolvedValueOnce(dsB);

    try {
      await JoinDatasetsNode.onNodeExecution(
        { valueA: dsA.valueschemas[0].name, valueB: dsB.valueschemas[0].name },
        { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
        {
          db,
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schemas should have same type');
    }
  });

  test('should validate datasets and join valueschemas', async () => {
    const schemaA: ValueSchema = {
      name: 'colA',
      unique: true,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaOnlyA: ValueSchema = {
      name: 'colOnlyA',
      unique: false,
      fallback: '',
      type: DataType.BOOLEAN,
      required: true
    };
    const schemaB: ValueSchema = {
      name: 'colB',
      unique: true,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaOnlyB: ValueSchema = {
      name: 'colOnlyB',
      unique: false,
      fallback: '',
      type: DataType.NUMBER,
      required: false
    };
    const otherColAinB: ValueSchema = {
      name: 'colA',
      unique: true,
      fallback: '',
      type: DataType.STRING,
      required: true
    };

    const dsA: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaA, schemaOnlyA],
      name: 'DS B',
      workspaceId: 'CDE'
    };
    const dsB: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaB, schemaOnlyB, otherColAinB],
      name: 'DS A',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'newid',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaB, schemaOnlyB],
      name: 'New DS',
      workspaceId: 'CDE'
    };

    (tryGetDataset as jest.Mock)
      .mockResolvedValueOnce(dsA)
      .mockResolvedValueOnce(dsB);
    (createDataset as jest.Mock).mockResolvedValue(newDs);
    (createDynamicDatasetName as jest.Mock).mockReturnValue(
      'FilterEntries-123'
    );
    (processEntries as jest.Mock).mockImplementation(() => ({}));

    const res = await JoinDatasetsNode.onNodeExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
      {
        db,
        node: NODE
      }
    );

    expect(res.results).toBeUndefined();
    expect(res.outputs.joined.datasetId).toBe(newDs.id);
    expect(createDataset as jest.Mock).toBeCalledWith(
      db,
      'FilterEntries-123',
      NODE.workspaceId
    );
    expect(addValueSchema as jest.Mock).toHaveBeenCalledTimes(5);
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...schemaA,
      unique: false,
      name: `A_${schemaA.name}`
    });
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...schemaOnlyA,
      unique: false,
      name: `A_${schemaOnlyA.name}`
    });
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...schemaB,
      unique: false,
      name: `B_${schemaB.name}`
    });
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...schemaOnlyB,
      unique: false,
      name: `B_${schemaOnlyB.name}`
    });
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...otherColAinB,
      unique: false,
      name: `B_${otherColAinB.name}`
    });
  });

  test('should support same column names', async () => {
    const sharedName = 'colx';

    const schemaA: ValueSchema = {
      name: sharedName,
      unique: true,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaB: ValueSchema = {
      name: sharedName,
      unique: true,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaOnlyB: ValueSchema = {
      name: 'colOnlyB',
      unique: false,
      fallback: '',
      type: DataType.NUMBER,
      required: false
    };

    const dsA: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaA],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const dsB: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaB, schemaOnlyB],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'newid',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaB, schemaOnlyB],
      name: 'New DS',
      workspaceId: 'CDE'
    };

    (tryGetDataset as jest.Mock)
      .mockResolvedValueOnce(dsA)
      .mockResolvedValueOnce(dsB);
    (createDataset as jest.Mock).mockResolvedValue(newDs);
    (createDynamicDatasetName as jest.Mock).mockReturnValue(
      'FilterEntries-123'
    );
    (processEntries as jest.Mock).mockImplementation(() => ({}));

    const res = await JoinDatasetsNode.onNodeExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
      {
        db,
        node: NODE
      }
    );

    expect(res.results).toBeUndefined();
    expect(res.outputs.joined.datasetId).toBe(newDs.id);
    expect(createDataset as jest.Mock).toBeCalledWith(
      db,
      'FilterEntries-123',
      NODE.workspaceId
    );
    expect(addValueSchema as jest.Mock).toHaveBeenCalledTimes(3);
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...schemaA,
      unique: false,
      name: `A_${schemaA.name}`
    });
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...schemaB,
      unique: false,
      name: `B_${schemaB.name}`
    });
    expect(addValueSchema as jest.Mock).toBeCalledWith(db, newDs.id, {
      ...schemaOnlyB,
      unique: false,
      name: `B_${schemaOnlyB.name}`
    });
  });

  test('should add joined entries', async () => {
    const schemaA: ValueSchema = {
      name: 'colA',
      unique: false,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaOnlyA: ValueSchema = {
      name: 'colOnlyA',
      unique: false,
      fallback: '',
      type: DataType.BOOLEAN,
      required: true
    };
    const schemaB: ValueSchema = {
      name: 'colB',
      unique: false,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaOnlyB: ValueSchema = {
      name: 'colOnlyB',
      unique: false,
      fallback: '',
      type: DataType.NUMBER,
      required: false
    };

    const dsA: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaA, schemaOnlyA],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const dsB: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaB, schemaOnlyB],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'newid',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [schemaB, schemaOnlyB],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    const entryA: Entry = {
      id: 'eA',
      values: { [schemaA.name]: 'test', [schemaOnlyA.name]: true }
    };
    const entryB1: Entry = {
      id: 'eB1',
      values: { [schemaB.name]: 'test', [schemaOnlyB.name]: 9 }
    };
    const entryB2: Entry = {
      id: 'eB2',
      values: { [schemaB.name]: 'test', [schemaOnlyB.name]: 8 }
    };

    const coll = db.collection(`Entries_${newDs.id}`);
    await coll.insertOne({
      values: [{ [schemaB.name]: 'test', [schemaOnlyB.name]: 9 }]
    });
    (tryGetDataset as jest.Mock)
      .mockResolvedValueOnce(dsA)
      .mockResolvedValueOnce(dsB);
    (createDataset as jest.Mock).mockResolvedValue(newDs);
    (addValueSchema as jest.Mock).mockResolvedValue(true);
    (createDynamicDatasetName as jest.Mock).mockReturnValue(
      'FilterEntries-123'
    );
    (createEntry as jest.Mock).mockResolvedValue({});
    (getEntryCollection as jest.Mock).mockReturnValue({
      find: () => {
        let hasNextCalls = 0;
        return {
          close: async () => true,
          next: async () => (hasNextCalls === 1 ? entryB1 : entryB2),
          hasNext: async () => {
            hasNextCalls += 1;

            if (hasNextCalls < 3) {
              return true;
            }
            return false;
          }
        };
      }
    });
    (processEntries as jest.Mock).mockImplementation(
      async (a, b, c, processFn) => processFn(entryA)
    );

    const res = await JoinDatasetsNode.onNodeExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
      { db, node: NODE }
    );

    expect(res.results).toBeUndefined();
    expect(res.outputs.joined.datasetId).toBe(newDs.id);
    expect(createEntry as jest.Mock).toHaveBeenCalledTimes(2);
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(db, newDs.id, {
      [`A_${schemaA.name}`]: 'test',
      [`B_${schemaB.name}`]: 'test',
      [`A_${schemaOnlyA.name}`]: true,
      [`B_${schemaOnlyB.name}`]: 8
    });
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(db, newDs.id, {
      [`A_${schemaA.name}`]: 'test',
      [`B_${schemaB.name}`]: 'test',
      [`A_${schemaOnlyA.name}`]: true,
      [`B_${schemaOnlyB.name}`]: 9
    });
  });

  test('should have absent metas', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(false);

    let res = await JoinDatasetsNode.onMetaExecution(
      { valueA: null, valueB: 'test' },
      {
        datasetA: { content: { schema: [] }, isPresent: true },
        datasetB: { content: { schema: [] }, isPresent: true }
      },
      db
    );
    expect(res).toEqual({
      joined: { isPresent: false, content: { schema: [] } }
    });

    res = await JoinDatasetsNode.onMetaExecution(
      { valueA: 'test', valueB: undefined },
      {
        datasetA: { content: { schema: [] }, isPresent: true },
        datasetB: { content: { schema: [] }, isPresent: true }
      },
      db
    );
    expect(res).toEqual({
      joined: { isPresent: false, content: { schema: [] } }
    });

    res = await JoinDatasetsNode.onMetaExecution(
      { valueA: 'test', valueB: '' },
      {
        datasetA: { content: { schema: [] }, isPresent: true },
        datasetB: { content: { schema: [] }, isPresent: true }
      },
      db
    );
    expect(res).toEqual({
      joined: { isPresent: false, content: { schema: [] } }
    });

    res = await JoinDatasetsNode.onMetaExecution(
      { valueA: 'test', valueB: 'test' },
      {
        datasetA: { content: { schema: [] }, isPresent: false },
        datasetB: { content: { schema: [] }, isPresent: true }
      },
      db
    );
    expect(res).toEqual({
      joined: { isPresent: false, content: { schema: [] } }
    });

    res = await JoinDatasetsNode.onMetaExecution(
      { valueA: 'test', valueB: 'test' },
      {
        datasetA: { content: { schema: [] }, isPresent: true },
        datasetB: { content: { schema: [] }, isPresent: false }
      },
      db
    );
    expect(res).toEqual({
      joined: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should have valid metas with joined keys', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

    const res = await JoinDatasetsNode.onMetaExecution(
      { valueA: 'testA', valueB: 'testB' },
      {
        datasetA: {
          content: {
            schema: [
              {
                name: 'testA',
                type: DataType.STRING,
                unique: false,
                required: true,
                fallback: ''
              },
              {
                name: 'other',
                type: DataType.STRING,
                unique: false,
                required: true,
                fallback: ''
              }
            ]
          },
          isPresent: true
        },
        datasetB: {
          content: {
            schema: [
              {
                name: 'testB',
                type: DataType.STRING,
                unique: false,
                required: true,
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
      joined: {
        isPresent: true,
        content: {
          schema: [
            {
              fallback: '',
              name: 'A_testA',
              required: true,
              type: DataType.STRING,
              unique: false
            },
            {
              fallback: '',
              name: 'A_other',
              required: true,
              type: DataType.STRING,
              unique: false
            },
            {
              fallback: '',
              name: 'B_testB',
              required: true,
              type: DataType.STRING,
              unique: false
            }
          ]
        }
      }
    });
  });
});
