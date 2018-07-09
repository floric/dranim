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

jest.mock('../../../src/main/workspace/entry');

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
    db = undefined;
    conn = undefined;
    server = undefined;
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should create, get and delete dataset', async () => {
    const newDs = await createDataset('test', {
      db,
      userId: ''
    });
    expect(newDs.id).toBeDefined();
    expect(newDs.name).toBe('test');
    expect(newDs.valueschemas).toEqual([]);

    const ds = await getDataset(newDs.id, {
      db,
      userId: ''
    });
    expect(ds).toEqual(newDs);

    const res = await deleteDataset(ds.id, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const unknownDs = await getDataset(newDs.id, {
      db,
      userId: ''
    });
    expect(unknownDs).toBe(null);
  });

  test('should add valueschema', async () => {
    const newDs = await createDataset('test', {
      db,
      userId: ''
    });
    expect(newDs.id).toBeDefined();
    expect(newDs.name).toBe('test');
    expect(newDs.valueschemas).toEqual([]);

    const res = await addValueSchema(newDs.id, SCHEMA, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const ds = await getDataset(newDs.id, {
      db,
      userId: ''
    });
    expect(ds.valueschemas.length).toBe(1);

    const fetchedSchema = ds.valueschemas[0];
    expect(fetchedSchema).toEqual(SCHEMA);
  });

  test('should throw error for invalid dataset', async () => {
    try {
      await addValueSchema(VALID_OBJECT_ID, SCHEMA, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Dataset not found');
    }
  });

  test('should throw error for empty dataset name', async () => {
    try {
      await createDataset('', {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Name must not be empty');
    }
  });

  test('should throw error for empty schema name', async () => {
    const newDs = await createDataset('test', {
      db,
      userId: ''
    });

    try {
      await addValueSchema(
        newDs.id,
        {
          name: '',
          unique: false,
          type: DataType.STRING,
          required: true,
          fallback: ''
        },
        {
          db,
          userId: ''
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Name must not be empty');
    }
  });

  test('should throw error for already existing schema', async () => {
    const newDs = await createDataset('test', {
      db,
      userId: ''
    });
    await addValueSchema(newDs.id, SCHEMA, {
      db,
      userId: ''
    });

    try {
      await addValueSchema(newDs.id, SCHEMA, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Schema already exists');
    }
  });

  test('should not create dataset with already used name', async () => {
    await createDataset('test', {
      db,
      userId: ''
    });

    try {
      await createDataset('test', {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Names must be unique');
    }
  });

  test('should return all datasets', async () => {
    const dsA = await createDataset('test', {
      db,
      userId: ''
    });
    const dsB = await createDataset('test2', {
      db,
      userId: ''
    });

    const all = await getAllDatasets({
      db,
      userId: ''
    });

    expect(all).toContainEqual(dsA);
    expect(all).toContainEqual(dsB);
  });
});
