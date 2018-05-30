import {
  DataType,
  FilterDatasetNodeDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { FilterDatasetNode } from '../../../../src/main/nodes/dataset/FilterDatasetNode';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getAllEntries
} from '../../../../src/main/workspace/entry';
import { getTestMongoDb } from '../../../test-utils';

let conn;
let db: Db;
let server;

describe('FilterDatasetNode', () => {
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
    expect(FilterDatasetNode.name).toBe(FilterDatasetNodeDef.name);
    expect(FilterDatasetNode.isFormValid).toBeDefined();
    expect(FilterDatasetNode.isInputValid).toBeDefined();
  });

  test('should have valid inputs', async () => {
    const res = await FilterDatasetNode.isInputValid({
      dataset: { id: 'test' }
    });
    expect(res).toBe(true);
  });

  test('should have invalid inputs', async () => {
    let res = await FilterDatasetNode.isInputValid({
      dataset: { id: '' }
    });
    expect(res).toBe(false);

    res = await FilterDatasetNode.isInputValid({
      dataset: { id: null }
    });
    expect(res).toBe(false);

    res = await FilterDatasetNode.isInputValid({
      dataset: undefined
    });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    const res = await FilterDatasetNode.isFormValid({
      conditions: {
        equals: [{ name: 'test', value: '42' }],
        greaterThan: [],
        isPresent: [],
        lessThan: []
      }
    });
    expect(res).toBe(true);
  });

  test('should have valid form', async () => {
    let res = await FilterDatasetNode.isFormValid({
      conditions: {
        equals: [],
        greaterThan: [],
        isPresent: [],
        lessThan: []
      }
    });
    expect(res).toBe(false);

    res = await FilterDatasetNode.isFormValid({
      conditions: null
    });
    expect(res).toBe(false);
  });

  test('should filter values less than and greater than thresholds', async () => {
    const ds = await createDataset(db, 'test');
    const schema: ValueSchema = {
      name: 'var',
      fallback: '0',
      required: true,
      type: DataType.NUMBER,
      unique: false
    };
    const increasingNumbers = Array(20)
      .fill(0)
      .map((_, i) => i);

    await addValueSchema(db, ds.id, schema);
    await Promise.all(
      increasingNumbers.map(i => createEntry(db, ds.id, { [schema.name]: i }))
    );

    const res = await FilterDatasetNode.onServerExecution(
      {
        conditions: {
          equals: [],
          greaterThan: [{ name: schema.name, value: '1.9' }],
          isPresent: [],
          lessThan: [{ name: schema.name, value: '2.1' }]
        }
      },
      { dataset: { id: ds.id } },
      db
    );

    expect(res.outputs.dataset.id).toBeDefined();

    const newDsId = res.outputs.dataset.id;

    const newDs = await getDataset(db, newDsId);
    expect(newDs).not.toBe(null);

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(1);
    expect(allEntries[0].values[schema.name]).toBe(2);
  });

  test('should filter values greater than threshold', async () => {
    const ds = await createDataset(db, 'test');
    const schema: ValueSchema = {
      name: 'var',
      fallback: '0',
      required: true,
      type: DataType.NUMBER,
      unique: false
    };
    const increasingNumbers = Array(20)
      .fill(0)
      .map((_, i) => i);

    await addValueSchema(db, ds.id, schema);
    await Promise.all(
      increasingNumbers.map(i => createEntry(db, ds.id, { [schema.name]: i }))
    );

    const res = await FilterDatasetNode.onServerExecution(
      {
        conditions: {
          equals: [],
          greaterThan: [{ name: schema.name, value: '9.9' }],
          isPresent: [],
          lessThan: []
        }
      },
      { dataset: { id: ds.id } },
      db
    );

    expect(res.outputs.dataset.id).toBeDefined();

    const newDsId = res.outputs.dataset.id;

    const newDs = await getDataset(db, newDsId);
    expect(newDs).not.toBe(null);

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(10);
    expect(allEntries.filter(e => e.values[schema.name] < 9.9).length).toBe(0);
  });

  test('should filter values equal to threshold', async () => {
    const ds = await createDataset(db, 'test');
    const schema: ValueSchema = {
      name: 'var',
      fallback: '0',
      required: true,
      type: DataType.NUMBER,
      unique: false
    };
    const increasingNumbers = Array(20)
      .fill(0)
      .map((_, i) => i);

    await addValueSchema(db, ds.id, schema);
    await Promise.all(
      increasingNumbers.map(i => createEntry(db, ds.id, { [schema.name]: i }))
    );

    const res = await FilterDatasetNode.onServerExecution(
      {
        conditions: {
          equals: [{ name: schema.name, value: '10' }],
          greaterThan: [],
          isPresent: [],
          lessThan: []
        }
      },
      { dataset: { id: ds.id } },
      db
    );

    expect(res.outputs.dataset.id).toBeDefined();

    const newDsId = res.outputs.dataset.id;

    const newDs = await getDataset(db, newDsId);
    expect(newDs).not.toBe(null);

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(1);
    expect(allEntries[0].values[schema.name]).toBe(10);
  });
});
