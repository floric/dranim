import { DataType, RemoveValuesNodeDef } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { RemoveValuesNode } from '../../../../src/main/nodes/entries/remove-values';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getAllEntries
} from '../../../../src/main/workspace/entry';
import { getTestMongoDb, NeverGoHereError, NODE } from '../../../test-utils';

let conn;
let db: Db;
let server;

describe('RemoveValuesNode', () => {
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
    expect(RemoveValuesNode.type).toBe(RemoveValuesNodeDef.type);
    expect(RemoveValuesNode.isFormValid).toBeDefined();
    expect(RemoveValuesNode.isInputValid).toBeUndefined();
  });

  test('should validate form', async () => {
    let res = await RemoveValuesNode.isFormValid({ values: [] });
    expect(res).toBe(false);

    res = await RemoveValuesNode.isFormValid({ values: null });
    expect(res).toBe(false);

    res = await RemoveValuesNode.isFormValid({ values: ['test'] });
    expect(res).toBe(true);
  });

  test('should select values from dataset and create new', async () => {
    const ds = await createDataset(db, 'test');
    await addValueSchema(db, ds.id, {
      name: 'test',
      required: true,
      type: DataType.STRING,
      fallback: '',
      unique: false
    });
    await addValueSchema(db, ds.id, {
      name: 'abc',
      required: false,
      type: DataType.STRING,
      fallback: '',
      unique: false
    });

    const res = await RemoveValuesNode.onNodeExecution(
      { values: ['test'] },
      { dataset: { datasetId: ds.id } },
      { db, node: NODE }
    );
    expect(res.outputs.dataset.datasetId).toBeDefined();

    const newDsId = res.outputs.dataset.datasetId;
    const newDs = await getDataset(db, newDsId);

    expect(newDs).not.toBe(null);
    expect(newDs.valueschemas.length).toBe(1);
    expect(newDs.valueschemas[0].name).toBe('test');
  });

  test('should select values from dataset and create new', async () => {
    const ds = await createDataset(db, 'test');
    await addValueSchema(db, ds.id, {
      name: 'test',
      required: true,
      type: DataType.STRING,
      fallback: '',
      unique: false
    });

    try {
      await RemoveValuesNode.onNodeExecution(
        { values: ['bla', 'test'] },
        { dataset: { datasetId: ds.id } },
        { db, node: NODE }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown value specified');
    }
  });

  test('should validate dataset', async () => {
    try {
      await RemoveValuesNode.onNodeExecution(
        { values: ['test'] },
        { dataset: { datasetId: 'ds.id' } },
        { db, node: NODE }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset');
    }
  });

  test('should copy all entries but only with selected values', async () => {
    const ds = await createDataset(db, 'test');
    await Promise.all(
      [
        {
          name: 'test',
          required: true,
          type: DataType.STRING,
          fallback: '',
          unique: false
        },
        {
          name: 'abc',
          required: false,
          type: DataType.STRING,
          fallback: '',
          unique: false
        },
        {
          name: 'other',
          required: false,
          type: DataType.STRING,
          fallback: '',
          unique: false
        }
      ].map(n => addValueSchema(db, ds.id, n))
    );

    await Promise.all(
      [
        { test: 'a', abc: 'b', other: 'b' },
        {
          test: 'sg',
          abc: 'dsgb',
          other: 'sb'
        },
        {
          test: 'asga',
          abc: 'dfhgb',
          other: 'dfhb'
        },
        {
          test: 'aas',
          abc: 'bdfh',
          other: 'bsg'
        }
      ].map(n => createEntry(db, ds.id, n))
    );

    const res = await RemoveValuesNode.onNodeExecution(
      { values: ['test', 'abc'] },
      { dataset: { datasetId: ds.id } },
      { db, node: NODE }
    );
    expect(res.outputs.dataset.datasetId).toBeDefined();

    const newDsId = res.outputs.dataset.datasetId;
    const newDs = await getDataset(db, newDsId);

    expect(newDs).not.toBe(null);
    expect(newDs.valueschemas.length).toBe(2);
    expect(newDs.valueschemas.filter(n => n.name === 'test')).toBeDefined();
    expect(newDs.valueschemas.filter(n => n.name === 'abc')).toBeDefined();

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(4);

    const correctEntries = allEntries.filter(
      n =>
        Object.keys(n.values).includes('test') &&
        Object.keys(n.values).includes('abc') &&
        !Object.keys(n.values).includes('other')
    );
    expect(correctEntries.length).toBe(4);
  });

  test('should return absent meta if dataset is missing', async () => {
    let res = await RemoveValuesNode.onMetaExecution(
      { values: ['test', 'abc'] },
      { dataset: null },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await RemoveValuesNode.onMetaExecution(
      { values: ['test', 'abc'] },
      { dataset: undefined },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });

    res = await RemoveValuesNode.onMetaExecution(
      { values: ['test', 'abc'] },
      { dataset: { content: { schema: [] }, isPresent: false } },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should return absent meta if values are empty', async () => {
    const res = await RemoveValuesNode.onMetaExecution(
      { values: [] },
      { dataset: { content: { schema: [] }, isPresent: true } },
      db
    );
    expect(res).toEqual({
      dataset: { isPresent: false, content: { schema: [] } }
    });
  });

  test('should return filtered meta data', async () => {
    const res = await RemoveValuesNode.onMetaExecution(
      { values: ['a', 'b'] },
      {
        dataset: {
          content: {
            schema: [
              {
                name: 'a',
                type: DataType.STRING,
                unique: false,
                required: false,
                fallback: ''
              },
              {
                name: 'b',
                type: DataType.STRING,
                unique: false,
                required: false,
                fallback: ''
              },
              {
                name: 'c',
                type: DataType.STRING,
                unique: false,
                required: false,
                fallback: ''
              },
              {
                name: 'd',
                type: DataType.STRING,
                unique: false,
                required: false,
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
      dataset: {
        isPresent: true,
        content: {
          schema: [
            {
              name: 'a',
              type: DataType.STRING,
              unique: false,
              required: false,
              fallback: ''
            },
            {
              name: 'b',
              type: DataType.STRING,
              unique: false,
              required: false,
              fallback: ''
            }
          ]
        }
      }
    });
  });
});
