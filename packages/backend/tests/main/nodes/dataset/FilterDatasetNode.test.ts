import {
  DataType,
  FilterDatasetNodeDef,
  ThresholdFilterOperator,
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
      [DataType.STRING]: {
        equals: [{ name: 'test', compareTo: '42' }],
        contains: []
      }
    });
    expect(res).toBe(true);
  });

  test('should have valid form', async () => {
    const res = await FilterDatasetNode.isFormValid({});
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
        [DataType.NUMBER]: {
          equals: [],
          threshold: [
            {
              name: schema.name,
              operator: ThresholdFilterOperator.GREATER_THAN,
              threshold: 1.9
            },
            {
              name: schema.name,
              operator: ThresholdFilterOperator.GREATER_THAN,
              threshold: 2.1
            }
          ]
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
        [DataType.NUMBER]: {
          equals: [],
          threshold: [
            {
              name: schema.name,
              operator: ThresholdFilterOperator.GREATER_THAN,
              threshold: 9.9
            }
          ]
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
        [DataType.NUMBER]: {
          equals: [
            {
              name: schema.name,
              compareTo: 10
            }
          ],
          threshold: []
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
