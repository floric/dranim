import { Dataset, DataType, ValueSchema } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { getDataset, tryGetDataset } from '../../../src/main/workspace/dataset';
import {
  clearEntries,
  createEntry,
  createEntryFromJSON,
  deleteEntry,
  getEntriesCount,
  getEntry,
  getEntryCollection,
  getLatestEntries
} from '../../../src/main/workspace/entry';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/workspace/dataset');

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
    const schema: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schema],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const schemaValue = 'test';
    const entry = await createEntry(db, ds.id, { [schema.name]: schemaValue });

    expect(entry.id).toBeDefined();
    expect(entry.values[schema.name]).toBe(schemaValue);

    const retrievedEntry = await getEntry(db, ds.id, entry.id);
    expect(retrievedEntry).toEqual(entry);

    const res = await deleteEntry(db, ds.id, entry.id);
    expect(res).toBe(true);

    const unknownEntry = await getEntry(db, ds.id, entry.id);
    expect(unknownEntry).toBe(null);
  });

  test('should return null for missing entry', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const res = await getEntry(db, ds.id, VALID_OBJECT_ID);
    expect(res).toBe(null);
  });

  test('should create entry from JSON payload', async () => {
    const schemaA: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: true,
      fallback: ''
    };
    const schemaB: ValueSchema = {
      name: 'abc',
      type: DataType.NUMBER,
      required: true,
      unique: false,
      fallback: '3'
    };

    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schemaA, schemaB],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const payload = {
      test: 'a',
      abc: 17
    };

    const entry = await createEntryFromJSON(db, ds.id, JSON.stringify(payload));

    const entryFromServer = await getEntry(db, ds.id, entry.id);

    expect(entry.values).toEqual(payload);
    expect(entryFromServer.values).toEqual(payload);
  });

  test('should throw error when creating entry with invalid ds id', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset');
    });

    try {
      await createEntryFromJSON(
        db,
        VALID_OBJECT_ID,
        JSON.stringify({ test: 9 })
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should get entries count', async () => {
    const schema: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };

    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schema],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const values = ['a', 'b', 'c', 'd', 'e'];
    await Promise.all(values.map(v => createEntry(db, ds.id, { test: v })));

    const count = await getEntriesCount(db, ds.id);
    expect(count).toBe(values.length);
  });

  test('should get latest entries', async () => {
    const schema: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };

    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schema],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const values = ['a', 'b', 'c', 'd', 'e'];
    await Promise.all(values.map(v => createEntry(db, ds.id, { test: v })));

    const entries = await getLatestEntries(db, ds.id);
    expect(entries.length).toBe(values.length);
    expect(
      entries.map(e => e.values).sort((a, b) => a.test.localeCompare(b.test))
    ).toEqual(values.map(v => ({ test: v })));
  });

  test('should throw error for undefined values', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(db, ds.id, { test: 'abc' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unsupported values provided');
    }
  });

  test('should throw error for missing values', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(db, ds.id, {});
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('No values specified for entry.');
    }
  });

  test('should throw error for null keys or undefined values', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(db, ds.id, { [null as any]: 9 });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unsupported values provided');
    }

    try {
      await createEntry(db, ds.id, { test: undefined });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Value malformed');
    }
  });

  test('should throw error for invalid dataset id', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset');
    });

    try {
      await createEntry(db, VALID_OBJECT_ID, { test: 9 });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should throw error for missing required values', async () => {
    const schemaA: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };
    const schemaB: ValueSchema = {
      name: 'abc',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schemaA, schemaB],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(db, ds.id, { [schemaA.name]: 'test' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Values from Schema not set');
    }
  });

  test('should throw error for missing required values', async () => {
    const schema: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: true,
      fallback: ''
    };
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schema],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(db, ds.id, {
        [schema.name]: 'test',
        unknown: 'test'
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unsupported values provided');
    }
  });

  test('should throw error for already used key', async () => {
    const schema: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: true,
      fallback: ''
    };
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schema],
      latestEntries: [],
      entriesCount: 0
    };

    const coll = getEntryCollection(db, ds.id);
    await coll.createIndex(`values.${schema.name}`, {
      unique: true
    });

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    await createEntry(db, ds.id, { [schema.name]: 'test' });

    try {
      await createEntry(db, ds.id, { [schema.name]: 'test' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Key already used');
    }
  });

  test('should throw error for invalid id formats', async () => {
    try {
      await deleteEntry(db, 'test', VALID_OBJECT_ID);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid ID');
    }

    try {
      await deleteEntry(db, VALID_OBJECT_ID, 'test');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid ID');
    }
  });

  test('should delete entries', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [
        {
          name: 'value',
          type: DataType.STRING,
          unique: false,
          fallback: '',
          required: true
        }
      ],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const [e1, e2, e3] = await Promise.all(
      [1, 2, 3].map(n => createEntry(db, ds.id, { value: n }))
    );

    await Promise.all([
      deleteEntry(db, ds.id, e1.id),
      deleteEntry(db, ds.id, e2.id)
    ]);

    const entriesCount = await getEntriesCount(db, ds.id);
    expect(entriesCount).toBe(1);
  });

  test('should clear entries', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [
        {
          name: 'value',
          type: DataType.STRING,
          unique: false,
          fallback: '',
          required: true
        }
      ],
      latestEntries: [],
      entriesCount: 0
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    await Promise.all(
      [1, 2, 3, 4, 5].map(n => createEntry(db, ds.id, { value: n }))
    );
    let entriesCount = await getEntriesCount(db, ds.id);
    expect(entriesCount).toBe(5);

    await clearEntries(db, ds.id);

    entriesCount = await getEntriesCount(db, ds.id);
    expect(entriesCount).toBe(0);
  });
});
