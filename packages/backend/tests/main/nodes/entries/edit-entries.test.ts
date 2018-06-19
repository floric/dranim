import {
  DatasetSocket,
  DataType,
  EditEntriesNodeDef,
  NodeInstance,
  sleep,
  StringInputNodeDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { EditEntriesNode } from '../../../../src/main/nodes/entries/edit-entries';
import { StringInputNode } from '../../../../src/main/nodes/string';
import {
  addValueSchema,
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getAllEntries
} from '../../../../src/main/workspace/entry';
import { createNode } from '../../../../src/main/workspace/nodes';
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
    expect(EditEntriesNode.type).toBe(EditEntriesNodeDef.type);
    expect(EditEntriesNode.isFormValid).toBeUndefined();
    expect(EditEntriesNode.isInputValid).toBeUndefined();
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
      {
        db,
        node: NODE,
        contextFnExecution: () => Promise.resolve({ outputs: {} }),
        updateProgress: () => {
          //
        }
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
      [],
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

  test('should edit entries', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const ds = await createDataset(db, 'ds 1');
    await addValueSchema(db, ds.id, {
      name: 'val',
      fallback: '',
      required: true,
      type: DataType.STRING,
      unique: false
    });

    await Promise.all(
      Array(20)
        .fill(0)
        .map((e, i) => createEntry(db, ds.id, { val: JSON.stringify(i) }))
    );

    const res = await EditEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: ds.id } },
      {
        db,
        node: NODE,
        contextFnExecution: input =>
          Promise.resolve({ outputs: { val: ':)' } }),
        updateProgress: () => {
          //
        }
      }
    );
    expect(res.outputs.dataset).toBeDefined();

    const newDs = await getDataset(db, res.outputs.dataset.datasetId);
    const oldDs = await getDataset(db, ds.id);
    expect(newDs.valueschemas).toEqual(oldDs.valueschemas);

    const allEntries = await getAllEntries(db, newDs.id);
    expect(allEntries.length).toBe(20);

    expect(allEntries[0].values.val).toBe(':)');
  });

  test('should throw errors for missing context', async () => {
    const ds = await createDataset(db, 'ds 1');

    try {
      await EditEntriesNode.onNodeExecution(
        {},
        { dataset: { datasetId: ds.id } },
        {
          db,
          node: NODE,
          updateProgress: () => {
            //
          }
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Missing context function');
    }
  });

  test('should throw error for invalid dataset', async () => {
    try {
      await EditEntriesNode.onNodeExecution(
        {},
        { dataset: { datasetId: VALID_OBJECT_ID } },
        {
          db,
          node: NODE,
          updateProgress: () => {
            //
          }
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset source');
    }
  });
});
