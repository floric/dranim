import {
  DatasetSocket,
  DataType,
  FilterEntriesNodeDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { FilterEntriesNode } from '../../../../src/main/nodes/entries/FilterEntriesNode';
import { createDataset } from '../../../../src/main/workspace/dataset';
import { getTestMongoDb, VALID_OBJECT_ID } from '../../../test-utils';

let conn;
let db: Db;
let server;

describe('FilterEntriesNode', () => {
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
    expect(FilterEntriesNode.name).toBe(FilterEntriesNodeDef.name);
    expect(FilterEntriesNode.isFormValid).toBeUndefined();
    expect(FilterEntriesNode.isInputValid).toBeDefined();
    expect(
      FilterEntriesNode.transformContextInputDefsToContextOutputDefs
    ).toBeDefined();
    expect(
      FilterEntriesNode.transformInputDefsToContextInputDefs
    ).toBeDefined();
  });

  test('should create new DS and do changes on this one', async () => {
    const ds = await createDataset(db, 'newds');

    const res = await FilterEntriesNode.onServerExecution(
      {},
      { dataset: { datasetId: ds.id } },
      db
    );
    expect(res.outputs.dataset.datasetId).toBeDefined();
    expect(res.outputs.dataset.datasetId).not.toBe(ds.id);
    expect(res.results).toBeUndefined();
  });

  test('should passthrough defs on onMetaExecution', async () => {
    const validDs = {
      content: {
        schema: [
          {
            type: DataType.BOOLEAN,
            name: 'super',
            required: false,
            unique: false,
            fallback: ''
          }
        ]
      },
      isPresent: true
    };
    const res = await FilterEntriesNode.onMetaExecution(
      {},
      { dataset: validDs },
      db
    );

    expect(res.dataset).toEqual(validDs);
  });

  test('should return empty object on onMetaExecution', async () => {
    let res = await FilterEntriesNode.onMetaExecution(
      {},
      { dataset: null },
      db
    );
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);

    res = await FilterEntriesNode.onMetaExecution(
      {},
      { dataset: undefined },
      db
    );
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);
  });

  test('should have valid input', async () => {
    const res = await FilterEntriesNode.isInputValid({
      dataset: { datasetId: VALID_OBJECT_ID }
    });
    expect(res).toBe(true);
  });

  test('should have invalid input', async () => {
    let res = await FilterEntriesNode.isInputValid({ dataset: undefined });
    expect(res).toBe(false);

    res = await FilterEntriesNode.isInputValid({
      dataset: { datasetId: null }
    });
    expect(res).toBe(false);
  });

  test('should use dataset schemas as dynamic inputs of context fn', async () => {
    const validDs = {
      content: {
        schema: [
          {
            type: DataType.BOOLEAN,
            name: 'super',
            required: false,
            unique: false,
            fallback: ''
          }
        ]
      },
      isPresent: true
    };

    const res = await FilterEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      db
    );

    expect(res).toEqual({
      super: {
        dataType: DataType.BOOLEAN,
        displayName: 'super',
        isDynamic: true
      }
    });
  });

  test('should return absent meta if dataset input is missing', async () => {
    let res = await FilterEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: { content: { schema: [] }, isPresent: false } },
      db
    );
    expect(res).toEqual({});

    res = await FilterEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: null },
      db
    );
    expect(res).toEqual({});
  });

  test('should always have keepEntries socket as output', async () => {
    const validDs = {
      content: {
        schema: [
          {
            type: DataType.BOOLEAN,
            name: 'super',
            required: false,
            unique: false,
            fallback: ''
          }
        ]
      },
      isPresent: true
    };

    const inputRes = await FilterEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      db
    );

    const res = await FilterEntriesNode.transformContextInputDefsToContextOutputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      inputRes,
      {},
      db
    );

    expect(res).toEqual({
      keepEntries: {
        dataType: DataType.BOOLEAN,
        displayName: 'Keep entries'
      }
    });
  });
});
