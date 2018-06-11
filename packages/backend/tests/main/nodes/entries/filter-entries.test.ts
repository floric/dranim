import {
  DatasetSocket,
  DataType,
  FilterEntriesNodeDef,
  NodeInstance,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { FilterEntriesNode } from '../../../../src/main/nodes/entries/filter-entries';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getAllEntries
} from '../../../../src/main/workspace/entry';
import { createWorkspace } from '../../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  NODE,
  VALID_OBJECT_ID
} from '../../../test-utils';

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

    const res = await FilterEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: ds.id } },
      {
        db,
        node: NODE,
        onContextFnExecution: input =>
          Promise.resolve({ outputs: { keepEntry: true } })
      }
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

  test('should always have keepEntry socket as output', async () => {
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
      [],
      db
    );

    expect(res).toEqual({
      keepEntry: {
        dataType: DataType.BOOLEAN,
        displayName: 'Keep entry'
      }
    });
  });

  test('should edit entries', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const ds = await createDataset(db, 'ds 1');
    await addValueSchema(db, ds.id, {
      name: 'val',
      fallback: '0',
      required: true,
      type: DataType.NUMBER,
      unique: false
    });

    await Promise.all(
      Array(20)
        .fill(0)
        .map((e, i) => createEntry(db, ds.id, { val: JSON.stringify(i) }))
    );

    const res = await FilterEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: ds.id } },
      {
        db,
        node: NODE,
        onContextFnExecution: input =>
          Promise.resolve({
            outputs: { keepEntry: input.val < 10 }
          })
      }
    );
    expect(res.outputs.dataset).toBeDefined();

    const newDs = await getDataset(db, res.outputs.dataset.datasetId);
    const oldDs = await getDataset(db, ds.id);
    expect(newDs.valueschemas).toEqual(oldDs.valueschemas);

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(10);
  });

  test('should throw errors for missing context', async () => {
    const ds = await createDataset(db, 'ds 1');

    try {
      await FilterEntriesNode.onNodeExecution(
        {},
        { dataset: { datasetId: ds.id } },
        {
          db,
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Missing context function');
    }
  });

  test('should throw errors for missing context', async () => {
    try {
      await FilterEntriesNode.onNodeExecution(
        {},
        { dataset: { datasetId: VALID_OBJECT_ID } },
        { db, node: NODE }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset source');
    }
  });
});
