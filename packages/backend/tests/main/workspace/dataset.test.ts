import { Db } from 'mongodb';

import { DataType, ValueSchema } from '@masterthesis/shared';

import {
  addValueSchema,
  createDataset,
  deleteDataset,
  getAllDatasets,
  getDataset
} from '../../../src/main/workspace/dataset';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

const SCHEMA: ValueSchema = {
  name: 'test',
  fallback: 'abc',
  required: false,
  type: DataType.STRING,
  unique: false
};

describe('Dataset', () => {
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

  test('should create, get and delete dataset', async () => {
    const newDs = await createDataset(db, 'test');
    expect(newDs.id).toBeDefined();
    expect(newDs.name).toBe('test');
    expect(newDs.valueschemas).toEqual([]);

    const ds = await getDataset(db, newDs.id);
    expect(ds).toEqual(newDs);

    const res = await deleteDataset(db, ds.id);
    expect(res).toBe(true);

    const unknownDs = await getDataset(db, newDs.id);
    expect(unknownDs).toBe(null);
  });

  test('should add valueschema', async () => {
    const newDs = await createDataset(db, 'test');
    expect(newDs.id).toBeDefined();
    expect(newDs.name).toBe('test');
    expect(newDs.valueschemas).toEqual([]);

    const res = await addValueSchema(db, newDs.id, SCHEMA);
    expect(res).toBe(true);

    const ds = await getDataset(db, newDs.id);
    expect(ds.valueschemas.length).toBe(1);

    const fetchedSchema = ds.valueschemas[0];
    expect(fetchedSchema).toEqual(SCHEMA);
  });

  test('should throw error for invalid dataset', async () => {
    try {
      await addValueSchema(db, VALID_OBJECT_ID, SCHEMA);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Dataset not found.');
    }
  });

  test('should throw error for empty schema name', async () => {
    const newDs = await createDataset(db, 'test');

    try {
      await addValueSchema(db, newDs.id, {
        name: '',
        unique: false,
        type: DataType.STRING,
        required: true,
        fallback: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Name must not be empty.');
    }
  });

  test('should throw error for already existing schema', async () => {
    const newDs = await createDataset(db, 'test');
    await addValueSchema(db, newDs.id, SCHEMA);

    try {
      await addValueSchema(db, newDs.id, SCHEMA);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schema already exists.');
    }
  });

  test('should not create dataset with already used name', async () => {
    await createDataset(db, 'test');

    try {
      await createDataset(db, 'test');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Names must be unique.');
    }
  });

  test('should return all datasets', async () => {
    const dsA = await createDataset(db, 'test');
    const dsB = await createDataset(db, 'test2');

    const all = await getAllDatasets(db);

    expect(all).toContainEqual(dsA);
    expect(all).toContainEqual(dsB);
  });
});
