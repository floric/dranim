import {
  allAreDefinedAndPresent,
  DataType,
  JoinDatasetsNodeDef,
  ValueSchema
} from '@masterthesis/shared';

import { JoinDatasetsNode } from '../../../../src/main/nodes/dataset/join-datasets';
import { getTestMongoDb, NeverGoHereError, NODE } from '../../../test-utils';

let conn;
let db;
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
    db = undefined;
    conn = undefined;
    server = undefined;
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
    try {
      await JoinDatasetsNode.onNodeExecution(
        { valueA: 'TEST', valueB: 'else' },
        {
          datasetA: {
            entries: [],
            schema: ['name', 'test', 'abc'].map(n => ({
              type: DataType.STRING,
              name: n,
              required: true,
              fallback: '',
              unique: false
            }))
          },
          datasetB: {
            entries: [],
            schema: ['name', 'test', 'abc'].map(n => ({
              type: DataType.STRING,
              name: n,
              required: true,
              fallback: '',
              unique: false
            }))
          }
        },
        {
          reqContext: { db, userId: '' },
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schema not found in Dataset');
    }
  });

  test('should throw error for unequal datatypes of values', async () => {
    try {
      await JoinDatasetsNode.onNodeExecution(
        { valueA: 'colA', valueB: 'colB' },
        {
          datasetA: {
            entries: [],
            schema: [
              {
                name: 'colA',
                unique: true,
                fallback: '',
                type: DataType.STRING,
                required: true
              }
            ]
          },
          datasetB: {
            entries: [],
            schema: [
              {
                name: 'colB',
                unique: true,
                fallback: '',
                type: DataType.NUMBER,
                required: true
              }
            ]
          }
        },
        {
          reqContext: { db, userId: '' },
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schema types do not match');
    }
  });

  test('should join entries and skip ones without matches', async () => {
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

    const res = await JoinDatasetsNode.onNodeExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      {
        datasetA: {
          entries: [{ [schemaA.name]: 'test', [schemaB.name]: 'notest' }],
          schema: [schemaA, schemaOnlyA]
        },
        datasetB: {
          entries: [{ [schemaA.name]: 'test', [schemaB.name]: 'notest' }],
          schema: [otherColAinB, schemaB, schemaOnlyB]
        }
      },
      {
        reqContext: { db, userId: '' },
        node: NODE
      }
    );

    expect(res.results).toBeUndefined();
    expect(res.outputs.joined.schema).toEqual([
      {
        fallback: '',
        name: 'A_colA',
        required: true,
        type: 'String',
        unique: true
      },
      {
        fallback: '',
        name: 'A_colOnlyA',
        required: true,
        type: 'Boolean',
        unique: false
      },
      {
        fallback: '',
        name: 'B_colA',
        required: true,
        type: 'String',
        unique: true
      },
      {
        fallback: '',
        name: 'B_colB',
        required: true,
        type: 'String',
        unique: true
      },
      {
        fallback: '',
        name: 'B_colOnlyB',
        required: false,
        type: 'Number',
        unique: false
      }
    ]);
    expect(res.outputs.joined.entries).toEqual([]);
  });

  test('should join entries', async () => {
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

    const entryA1 = { [schemaA.name]: 'test', [schemaOnlyA.name]: true };
    const entryA2 = { [schemaA.name]: 'test', [schemaOnlyA.name]: false };
    const entryB1 = { [schemaB.name]: 'test', [schemaOnlyB.name]: 9 };
    const entryB2 = { [schemaB.name]: 'test', [schemaOnlyB.name]: 8 };

    const res = await JoinDatasetsNode.onNodeExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      {
        datasetA: {
          entries: [entryA1, entryA2],
          schema: [schemaA, schemaOnlyA]
        },
        datasetB: {
          entries: [entryB1, entryB2],
          schema: [schemaB, schemaOnlyB]
        }
      },
      {
        reqContext: { db, userId: '' },
        node: NODE
      }
    );

    expect(res.outputs.joined.schema).toEqual([
      {
        fallback: '',
        name: 'A_colA',
        required: true,
        type: 'String',
        unique: false
      },
      {
        fallback: '',
        name: 'A_colOnlyA',
        required: true,
        type: 'Boolean',
        unique: false
      },
      {
        fallback: '',
        name: 'B_colB',
        required: true,
        type: 'String',
        unique: false
      },
      {
        fallback: '',
        name: 'B_colOnlyB',
        required: false,
        type: 'Number',
        unique: false
      }
    ]);
    expect(res.outputs.joined.entries).toEqual([
      { A_colA: 'test', A_colOnlyA: true, B_colB: 'test', B_colOnlyB: 9 },
      { A_colA: 'test', A_colOnlyA: true, B_colB: 'test', B_colOnlyB: 8 },
      { A_colA: 'test', A_colOnlyA: false, B_colB: 'test', B_colOnlyB: 9 },
      { A_colA: 'test', A_colOnlyA: false, B_colB: 'test', B_colOnlyB: 8 }
    ]);
  });

  test('should have absent metas', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(false);

    let res = await JoinDatasetsNode.onMetaExecution(
      { valueA: null, valueB: 'test' },
      {
        datasetA: { content: { schema: [] }, isPresent: true },
        datasetB: { content: { schema: [] }, isPresent: true }
      },
      { db, userId: '' }
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
      { db, userId: '' }
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
      { db, userId: '' }
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
      { db, userId: '' }
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
      { db, userId: '' }
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
      { db, userId: '' }
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
