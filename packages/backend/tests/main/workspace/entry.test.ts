import { DataType } from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { createEntry, getEntry } from '../../../src/main/workspace/entry';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

describe('Entry', () => {
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

  test('should create, get and delete entry', async () => {
    const schema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };
    const schemaValue = 'test';

    const ds = await createDataset(db, 'ds1');
    const res = await addValueSchema(db, ds.id, schema);
    expect(res).toBe(true);

    const entry = await createEntry(db, ds.id, [
      { name: schema.name, val: schemaValue }
    ]);

    expect(entry.id).toBeDefined();
    expect(entry.values[schema.name]).toBe(schemaValue);

    const retrievedEntry = await getEntry(db, ds.id, entry.id);
    expect(retrievedEntry).toEqual(entry);
  });

  test('should throw error for undefined values', async () => {
    const ds = await createDataset(db, 'ds1');

    try {
      await createEntry(db, ds.id, [{ name: 'test', val: 'abc' }]);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unsupported values provided');
    }
  });

  test('should throw error for missing values', async () => {
    const ds = await createDataset(db, 'ds1');

    try {
      await createEntry(db, ds.id, []);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('No values specified for entry.');
    }
  });

  test('should throw error for missing values', async () => {
    const ds = await createDataset(db, 'ds1');

    try {
      await createEntry(db, ds.id, [{ name: null, val: 9 }] as any);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Value malformed');
    }

    try {
      await createEntry(db, ds.id, [{ name: 'test' }] as any);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Value malformed');
    }
  });

  test('should throw error for invalid dataset id', async () => {
    try {
      await createEntry(db, VALID_OBJECT_ID, [{ name: 'test', val: 9 }] as any);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid dataset');
    }
  });

  test('should throw error for missing required values', async () => {
    const schemaA = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };
    const schemaB = {
      name: 'abc',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };

    const ds = await createDataset(db, 'ds1');
    await addValueSchema(db, ds.id, schemaA);
    await addValueSchema(db, ds.id, schemaB);

    try {
      await createEntry(db, ds.id, [{ name: schemaA.name, val: 'test' }]);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Values from Schema not set');
    }
  });

  test('should throw error for missing required values', async () => {
    const schemaA = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };

    const ds = await createDataset(db, 'ds1');
    await addValueSchema(db, ds.id, schemaA);

    try {
      await createEntry(db, ds.id, [
        { name: schemaA.name, val: 'test' },
        { name: 'unknown', val: 'test' }
      ]);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unsupported values provided');
    }
  });

  test('should throw error for already used key', async () => {
    const schemaA = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: true,
      fallback: ''
    };

    const ds = await createDataset(db, 'ds1');
    await addValueSchema(db, ds.id, schemaA);

    await createEntry(db, ds.id, [{ name: schemaA.name, val: 'test' }]);

    try {
      await createEntry(db, ds.id, [{ name: schemaA.name, val: 'test' }]);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Key already used');
    }
  });
});
