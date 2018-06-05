import {
  DatasetSocket,
  DataType,
  EditEntriesNodeDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { EditEntriesNode } from '../../../../src/main/nodes/entries/edit-entries';
import { createDataset } from '../../../../src/main/workspace/dataset';
import { getTestMongoDb, VALID_OBJECT_ID } from '../../../test-utils';

let conn;
let db: Db;
let server;

describe('EditEntriesNode', () => {
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
    expect(EditEntriesNode.name).toBe(EditEntriesNodeDef.name);
    expect(EditEntriesNode.isFormValid).toBeUndefined();
    expect(EditEntriesNode.isInputValid).toBeDefined();
    expect(
      EditEntriesNode.transformContextInputDefsToContextOutputDefs
    ).toBeDefined();
    expect(EditEntriesNode.transformInputDefsToContextInputDefs).toBeDefined();
  });

  test('should create new DS and do changes on this one', async () => {
    const ds = await createDataset(db, 'newds');

    const res = await EditEntriesNode.onNodeExecution(
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
    const res = await EditEntriesNode.onMetaExecution(
      {},
      { dataset: validDs },
      db
    );

    expect(res.dataset).toEqual(validDs);
  });

  test('should return empty object on onMetaExecution', async () => {
    let res = await EditEntriesNode.onMetaExecution({}, { dataset: null }, db);
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);

    res = await EditEntriesNode.onMetaExecution({}, { dataset: undefined }, db);
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);
  });

  test('should have valid input', async () => {
    const res = await EditEntriesNode.isInputValid({
      dataset: { datasetId: VALID_OBJECT_ID }
    });
    expect(res).toBe(true);
  });

  test('should have invalid input', async () => {
    let res = await EditEntriesNode.isInputValid({ dataset: undefined });
    expect(res).toBe(false);

    res = await EditEntriesNode.isInputValid({ dataset: { datasetId: null } });
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

    const res = await EditEntriesNode.transformInputDefsToContextInputDefs(
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

  test('should passthrough dynamic inputs of context input node', async () => {
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

    const inputRes = await EditEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      db
    );

    const res = await EditEntriesNode.transformContextInputDefsToContextOutputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      inputRes,
      {},
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
});
