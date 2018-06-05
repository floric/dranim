import {
  DataType,
  JoinDatasetsNodeDef,
  sleep,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { JoinDatasetsNode } from '../../../../src/main/nodes/dataset/JoinDatasetsNode';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getAllEntries
} from '../../../../src/main/workspace/entry';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../../test-utils';

let conn;
let db: Db;
let server;

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
    expect(JoinDatasetsNode.name).toBe(JoinDatasetsNodeDef.name);
    expect(JoinDatasetsNode.isFormValid).toBeDefined();
    expect(JoinDatasetsNode.isInputValid).toBeDefined();
  });

  test('should have valid inputs and invalid inputs', async () => {
    let res = await JoinDatasetsNode.isInputValid({
      datasetA: { datasetId: 'a' },
      datasetB: { datasetId: 'b' }
    });
    expect(res).toBe(true);

    res = await JoinDatasetsNode.isInputValid({
      datasetA: { datasetId: null },
      datasetB: { datasetId: 'a' }
    });
    expect(res).toBe(false);

    res = await JoinDatasetsNode.isInputValid({
      datasetA: null,
      datasetB: { datasetId: 't' }
    });
    expect(res).toBe(false);
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

  test('should stop for not found datasets', async () => {
    const dsA = await createDataset(db, 'a');

    try {
      await JoinDatasetsNode.onServerExecution(
        { valueA: 'TEST', valueB: 'else' },
        {
          datasetA: { datasetId: dsA.id },
          datasetB: { datasetId: VALID_OBJECT_ID }
        },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should stop for not found schemas', async () => {
    const [dsA, dsB] = await Promise.all([
      createDataset(db, 'a'),
      createDataset(db, 'b')
    ]);

    try {
      await JoinDatasetsNode.onServerExecution(
        { valueA: 'TEST', valueB: 'else' },
        { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schema not found');
    }
  });

  test('should throw error for unequal datatypes of values', async () => {
    const [dsA, dsB] = await Promise.all([
      createDataset(db, 'a'),
      createDataset(db, 'b')
    ]);
    const schemaA: ValueSchema = {
      name: 'colA',
      unique: true,
      fallback: '',
      type: DataType.STRING,
      required: true
    };
    const schemaB: ValueSchema = {
      name: 'colB',
      unique: true,
      fallback: '',
      type: DataType.NUMBER,
      required: true
    };

    await Promise.all([
      addValueSchema(db, dsA.id, schemaA),
      addValueSchema(db, dsB.id, schemaB)
    ]);

    try {
      await JoinDatasetsNode.onServerExecution(
        { valueA: schemaA.name, valueB: schemaB.name },
        { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schemas should have same type');
    }
  });

  test('should validate datasets and join valueschemas', async () => {
    const [dsA, dsB] = await Promise.all([
      createDataset(db, 'a'),
      createDataset(db, 'b')
    ]);
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

    await Promise.all([
      addValueSchema(db, dsA.id, schemaA),
      addValueSchema(db, dsB.id, schemaB),
      addValueSchema(db, dsA.id, schemaOnlyA),
      addValueSchema(db, dsB.id, schemaOnlyB),
      addValueSchema(db, dsB.id, otherColAinB)
    ]);

    const res = await JoinDatasetsNode.onServerExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
      db
    );

    const newDs = await getDataset(db, res.outputs.joined.datasetId);
    const newColASchema = newDs.valueschemas.find(
      n => n.name === `A_${schemaOnlyA.name}`
    );
    const newColBSchema = newDs.valueschemas.find(
      n => n.name === `B_${schemaOnlyB.name}`
    );

    expect(newDs).not.toBe(null);
    expect(newColASchema).toBeDefined();
    expect(newColBSchema).toBeDefined();
    expect(newColASchema.unique).toBe(false);
    expect(newColBSchema.unique).toBe(false);
    expect(newDs.valueschemas.length).toBe(5);
  });

  test('should support same column names', async () => {
    const [dsA, dsB] = await Promise.all([
      createDataset(db, 'a'),
      createDataset(db, 'b')
    ]);
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

    await Promise.all([
      addValueSchema(db, dsA.id, schemaA),
      addValueSchema(db, dsB.id, schemaB),
      addValueSchema(db, dsB.id, schemaOnlyB)
    ]);

    const res = await JoinDatasetsNode.onServerExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
      db
    );

    const newDs = await getDataset(db, res.outputs.joined.datasetId);

    const newColASchema = newDs.valueschemas.find(
      n => n.name === `A_${sharedName}`
    );
    const newColBSchema = newDs.valueschemas.find(
      n => n.name === `B_${sharedName}`
    );
    expect(newDs).not.toBe(null);
    expect(newColASchema).toBeDefined();
    expect(newColASchema.unique).toBe(true);
    expect(newColBSchema).toBeDefined();
    expect(newColBSchema.unique).toBe(true);
    expect(newDs.valueschemas.length).toBe(3);
  });

  test('should add joined entries', async () => {
    const [dsA, dsB] = await Promise.all([
      createDataset(db, 'a'),
      createDataset(db, 'b')
    ]);
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

    await Promise.all([
      addValueSchema(db, dsA.id, schemaA),
      addValueSchema(db, dsB.id, schemaB),
      addValueSchema(db, dsA.id, schemaOnlyA),
      addValueSchema(db, dsB.id, schemaOnlyB)
    ]);

    await Promise.all(
      [
        {
          [schemaA.name]: 'test',
          [schemaOnlyA.name]: 'true'
        },
        {
          [schemaA.name]: 'test2',
          [schemaOnlyA.name]: 'false'
        },
        {
          [schemaA.name]: 'otherA',
          [schemaOnlyA.name]: 'false'
        }
      ].map(n => createEntry(db, dsA.id, n))
    );

    await Promise.all(
      [
        {
          [schemaB.name]: 'test',
          [schemaOnlyB.name]: 'true'
        },
        {
          [schemaB.name]: 'test',
          [schemaOnlyB.name]: '1'
        },
        {
          [schemaB.name]: 'test2',
          [schemaOnlyB.name]: '2'
        },
        {
          [schemaB.name]: 'otherB',
          [schemaOnlyB.name]: '3'
        }
      ].map(n => createEntry(db, dsB.id, n))
    );

    const res = await JoinDatasetsNode.onServerExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      { datasetA: { datasetId: dsA.id }, datasetB: { datasetId: dsB.id } },
      db
    );

    const newDs = await getDataset(db, res.outputs.joined.datasetId);
    expect(newDs).not.toBe(null);

    await sleep(100);

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(3);
    expect(allEntries[0].values.A_colA).toBeDefined();
    expect(allEntries[0].values.A_colOnlyA).toBeDefined();
    expect(allEntries[0].values.B_colB).toBeDefined();
    expect(allEntries[0].values.B_colOnlyB).toBeDefined();
  });

  test('should have absent metas', async () => {
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
              type: 'String',
              unique: false
            },
            {
              fallback: '',
              name: 'A_other',
              required: true,
              type: 'String',
              unique: false
            },
            {
              fallback: '',
              name: 'B_testB',
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
