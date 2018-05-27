import {
  DataType,
  JoinDatasetsNodeDef,
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
      datasetA: { id: 'a' },
      datasetB: { id: 'b' }
    });
    expect(res).toBe(true);

    res = await JoinDatasetsNode.isInputValid({
      datasetA: { id: null },
      datasetB: { id: 'a' }
    });
    expect(res).toBe(false);

    res = await JoinDatasetsNode.isInputValid({
      datasetA: null,
      datasetB: { id: 't' }
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
      const res = await JoinDatasetsNode.onServerExecution(
        { valueA: 'TEST', valueB: 'else' },
        { datasetA: { id: dsA.id }, datasetB: { id: VALID_OBJECT_ID } },
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
      const res = await JoinDatasetsNode.onServerExecution(
        { valueA: 'TEST', valueB: 'else' },
        { datasetA: { id: dsA.id }, datasetB: { id: dsB.id } },
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
        { datasetA: { id: dsA.id }, datasetB: { id: dsB.id } },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schemas should have same type');
    }
  });
  test('should validate datasets and if values exist on each of them', async () => {
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
      { datasetA: { id: dsA.id }, datasetB: { id: dsB.id } },
      db
    );

    const newDs = await getDataset(db, res.outputs.joined.id);

    const newColASchema = newDs.valueschemas.find(
      n => n.name === schemaOnlyA.name
    );
    const newColBSchema = newDs.valueschemas.find(
      n => n.name === schemaOnlyB.name
    );
    expect(newDs).not.toBe(null);
    expect(newColASchema).toBeDefined();
    expect(newColBSchema).toBeDefined();
    expect(newColASchema.unique).toBe(false);
    expect(newColBSchema.unique).toBe(false);
    expect(newDs.valueschemas.length).toBe(4);
  });

  test('should add joined entries', async () => {
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
        [
          { name: schemaA.name, val: 'test' },
          { name: schemaOnlyA.name, val: 'true' }
        ],
        [
          { name: schemaA.name, val: 'test2' },
          { name: schemaOnlyA.name, val: 'false' }
        ],
        [
          { name: schemaA.name, val: 'otherA' },
          { name: schemaOnlyA.name, val: 'false' }
        ]
      ].map(n => createEntry(db, dsA.id, n))
    );

    await Promise.all(
      [
        [
          { name: schemaB.name, val: 'test' },
          { name: schemaOnlyB.name, val: 'true' }
        ],
        [
          { name: schemaB.name, val: 'test' },
          { name: schemaOnlyB.name, val: '1' }
        ],
        [
          { name: schemaB.name, val: 'test2' },
          { name: schemaOnlyB.name, val: '2' }
        ],
        [
          { name: schemaB.name, val: 'otherB' },
          { name: schemaOnlyB.name, val: '3' }
        ]
      ].map(n => createEntry(db, dsB.id, n))
    );

    const res = await JoinDatasetsNode.onServerExecution(
      { valueA: schemaA.name, valueB: schemaB.name },
      { datasetA: { id: dsA.id }, datasetB: { id: dsB.id } },
      db
    );

    const newDs = await getDataset(db, res.outputs.joined.id);
    expect(newDs).not.toBe(null);

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(3);
  });
});
