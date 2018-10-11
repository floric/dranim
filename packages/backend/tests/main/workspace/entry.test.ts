import { Dataset, DataType, ValueSchema } from '@masterthesis/shared';

import { getDataset, tryGetDataset } from '../../../src/main/workspace/dataset';
import {
  clearEntries,
  createEntry,
  createEntryFromJSON,
  createManyEntries,
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
let db;
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
    db = undefined;
    conn = undefined;
    server = undefined;
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
      userId: '',
      created: '',
      description: '',
      id: VALID_OBJECT_ID,
      name: 'ds',
      workspaceId: 'ws',
      valueschemas: [schema]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const schemaValue = 'test';
    const entry = await createEntry(
      ds.id,
      { [schema.name]: schemaValue },
      {
        db,
        userId: ''
      }
    );

    expect(entry.id).toBeDefined();
    expect(entry.values[schema.name]).toBe(schemaValue);

    const retrievedEntry = await getEntry(ds.id, entry.id, {
      db,
      userId: ''
    });
    expect(retrievedEntry).toEqual(entry);

    const res = await deleteEntry(ds.id, entry.id, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const unknownEntry = await getEntry(ds.id, entry.id, {
      db,
      userId: ''
    });
    expect(unknownEntry).toBe(null);
  });

  test('should return null for missing entry', async () => {
    const ds: Dataset = {
      userId: '',
      id: VALID_OBJECT_ID,
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: []
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const res = await getEntry(ds.id, VALID_OBJECT_ID, {
      db,
      userId: ''
    });
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
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [schemaA, schemaB]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const payload = {
      test: 'a',
      abc: 17
    };

    const entry = await createEntryFromJSON(ds.id, JSON.stringify(payload), {
      db,
      userId: ''
    });

    const entryFromServer = await getEntry(ds.id, entry.id, {
      db,
      userId: ''
    });

    expect(entry.values).toEqual(payload);
    expect(entryFromServer.values).toEqual(payload);
  });

  test('should throw error when creating entry with invalid ds id', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset');
    });

    try {
      await createEntryFromJSON(VALID_OBJECT_ID, JSON.stringify({ test: 9 }), {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should get entries count', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [
        {
          name: 'test',
          type: DataType.STRING,
          required: true,
          unique: false,
          fallback: ''
        }
      ]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const values = ['a', 'b', 'c', 'd', 'e'];
    await Promise.all(
      values.map(v =>
        createEntry(
          ds.id,
          { test: v },
          {
            db,
            userId: ''
          }
        )
      )
    );

    const count = await getEntriesCount(ds.id, {
      db,
      userId: ''
    });
    expect(count).toBe(values.length);
  });

  test('should get estimated entries count', async () => {
    const schema: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: false,
      fallback: ''
    };

    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [schema]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const values = ['a', 'b', 'c', 'd', 'e'];
    await Promise.all(
      values.map(v =>
        createEntry(
          ds.id,
          { test: v },
          {
            db,
            userId: ''
          }
        )
      )
    );

    const count = await getEntriesCount(
      ds.id,
      {
        db,
        userId: ''
      },
      { estimate: true }
    );
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
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [schema]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const values = ['a', 'b', 'c', 'd', 'e'];
    await Promise.all(
      values.map(v =>
        createEntry(
          ds.id,
          { test: v },
          {
            db,
            userId: ''
          }
        )
      )
    );

    const entries = await getLatestEntries(ds.id, {
      db,
      userId: ''
    });
    expect(entries.length).toBe(values.length);
    expect(
      entries.map(e => e.values).sort((a, b) => a.test.localeCompare(b.test))
    ).toEqual(values.map(v => ({ test: v })));
  });

  test('should throw error for undefined values', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: []
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(
        ds.id,
        { test: 'abc' },
        {
          db,
          userId: ''
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unsupported values provided');
    }
  });

  test('should throw error for missing values', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: []
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(
        ds.id,
        {},
        {
          db,
          userId: ''
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('No values specified for entry.');
    }
  });

  test('should throw error for null keys or undefined values', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: []
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(
        ds.id,
        { [null as any]: 9 },
        {
          db,
          userId: ''
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unsupported values provided');
    }

    try {
      await createEntry(
        ds.id,
        { test: undefined },
        {
          db,
          userId: ''
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Value malformed: {}');
    }
  });

  test('should throw error for invalid dataset id', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset');
    });

    try {
      await createEntry(
        VALID_OBJECT_ID,
        { test: 9 },
        {
          db,
          userId: ''
        }
      );
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
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [schemaA, schemaB]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(
        ds.id,
        { [schemaA.name]: 'test' },
        {
          db,
          userId: ''
        }
      );
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
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [schema]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    try {
      await createEntry(
        ds.id,
        {
          [schema.name]: 'test',
          unknown: 'test'
        },
        {
          db,
          userId: ''
        }
      );
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
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [schema]
    };

    const coll = getEntryCollection(ds.id, db);
    await coll.createIndex(`values.${schema.name}`, {
      unique: true
    });

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    await createEntry(
      ds.id,
      { [schema.name]: 'test' },
      {
        db,
        userId: ''
      }
    );

    try {
      await createEntry(
        ds.id,
        { [schema.name]: 'test' },
        {
          db,
          userId: ''
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Key already used');
    }
  });

  test('should bypass schema validation when creating entry', async () => {
    const schema: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      required: true,
      unique: true,
      fallback: ''
    };
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [schema]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    await createEntry(
      ds.id,
      { unknown: 'test' },
      {
        db,
        userId: ''
      },
      { skipSchemaValidation: true }
    );
    await createEntry(
      ds.id,
      { else: 'test' },
      {
        db,
        userId: ''
      },
      { skipSchemaValidation: true }
    );
  });

  test('should throw error for invalid id formats', async () => {
    try {
      await deleteEntry('test', VALID_OBJECT_ID, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Deleting entry failed');
    }

    try {
      await deleteEntry(VALID_OBJECT_ID, 'test', {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Deleting entry failed');
    }
  });

  test('should delete entries', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [
        {
          name: 'value',
          type: DataType.STRING,
          unique: false,
          fallback: '',
          required: true
        }
      ]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const [e1, e2, e3] = await Promise.all(
      [1, 2, 3].map(n =>
        createEntry(
          ds.id,
          { value: n },
          {
            db,
            userId: ''
          }
        )
      )
    );

    await Promise.all([
      deleteEntry(ds.id, e1.id, {
        db,
        userId: ''
      }),
      deleteEntry(ds.id, e2.id, {
        db,
        userId: ''
      })
    ]);

    const entriesCount = await getEntriesCount(ds.id, {
      db,
      userId: ''
    });
    expect(entriesCount).toBe(1);
  });

  test('should get latest entries', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [
        {
          name: 'value',
          type: DataType.STRING,
          unique: false,
          fallback: '',
          required: true
        }
      ]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    await Promise.all(
      [1, 2, 3, 4, 5].map(n =>
        createEntry(
          ds.id,
          { value: n },
          {
            db,
            userId: ''
          }
        )
      )
    );

    let allEntries = await getLatestEntries(ds.id, { db, userId: '' });
    expect(allEntries.length).toBe(5);

    allEntries = await getLatestEntries(
      ds.id,
      { db, userId: '' },
      { count: 3 }
    );
    expect(allEntries.length).toBe(3);
  });

  test('should clear entries', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [
        {
          name: 'value',
          type: DataType.STRING,
          unique: false,
          fallback: '',
          required: true
        }
      ]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    await Promise.all(
      [1, 2, 3, 4, 5].map(n =>
        createEntry(
          ds.id,
          { value: n },
          {
            db,
            userId: ''
          }
        )
      )
    );
    let entriesCount = await getEntriesCount(ds.id, {
      db,
      userId: ''
    });
    expect(entriesCount).toBe(5);

    const allEntries = await getLatestEntries(ds.id, { db, userId: '' });
    expect(allEntries.length).toBe(5);

    await clearEntries(ds.id, {
      db,
      userId: ''
    });

    entriesCount = await getEntriesCount(ds.id, {
      db,
      userId: ''
    });
    expect(entriesCount).toBe(0);
  });

  test('should create many entries', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      userId: '',
      name: 'ds',
      created: '',
      description: '',
      workspaceId: 'ws',
      valueschemas: [
        {
          name: 'value',
          type: DataType.STRING,
          unique: false,
          fallback: '',
          required: true
        }
      ]
    };

    (getDataset as jest.Mock).mockResolvedValue(ds);
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);

    const res = await createManyEntries(
      VALID_OBJECT_ID,
      [{ test: 1 }, { test: 2 }],
      { db, userId: '' }
    );
    expect(res).toBe(true);

    const entriesCount = await getEntriesCount(VALID_OBJECT_ID, {
      db,
      userId: ''
    });
    expect(entriesCount).toBe(2);
  });

  test('should catch error when calling createManyEntries throws error', async () => {
    try {
      await createManyEntries(VALID_OBJECT_ID, [null], {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Writing entry failed.');
    }
  });

  test('should do nothing when calling createManyEntries with empty list', async () => {
    const res = await createManyEntries(VALID_OBJECT_ID, [], {
      db,
      userId: ''
    });
    expect(res).toBe(true);
  });
});
