import {
  AddValuesNodeDef,
  DatasetSocket,
  DataType,
  NodeInstance,
  sleep,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { AddValuesNode } from '../../../../src/main/nodes/entries/add-values';
import {
  addValueSchema,
  createDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getAllEntries
} from '../../../../src/main/workspace/entry';
import { createNode } from '../../../../src/main/workspace/nodes';
import { addOrUpdateFormValue } from '../../../../src/main/workspace/nodes-detail';
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

describe('AddValuesNode', () => {
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
    expect(AddValuesNode.name).toBe(AddValuesNodeDef.name);
    expect(AddValuesNode.isFormValid).toBeDefined();
    expect(AddValuesNode.isInputValid).toBeDefined();
    expect(
      AddValuesNode.transformContextInputDefsToContextOutputDefs
    ).toBeDefined();
    expect(AddValuesNode.transformInputDefsToContextInputDefs).toBeDefined();
  });

  test('should have invalid form', async () => {
    let res = await AddValuesNode.isFormValid({ values: [] });
    expect(res).toBe(false);

    res = await AddValuesNode.isFormValid({ values: undefined });
    expect(res).toBe(false);

    res = await AddValuesNode.isFormValid({ values: null });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    const res = await AddValuesNode.isFormValid({
      values: [
        {
          type: DataType.STRING,
          name: 'test',
          required: true,
          unique: false,
          fallback: ''
        }
      ]
    });
    expect(res).toBe(true);
  });

  test('should have invalid input', async () => {
    let res = await AddValuesNode.isInputValid({
      dataset: undefined
    });
    expect(res).toBe(false);

    res = await AddValuesNode.isInputValid({
      dataset: null
    });
    expect(res).toBe(false);

    res = await AddValuesNode.isInputValid({
      dataset: { datasetId: '' }
    });
    expect(res).toBe(false);
  });

  test('should have valid input', async () => {
    const res = await AddValuesNode.isInputValid({
      dataset: { datasetId: VALID_OBJECT_ID }
    });
    expect(res).toBe(true);
  });

  test('should have absent meta', async () => {
    let res = await AddValuesNode.onMetaExecution(
      { values: [] },
      { dataset: null },
      null
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await AddValuesNode.onMetaExecution(
      { values: [] },
      { dataset: { content: { schema: [] }, isPresent: false } },
      null
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });
  });

  test('should have present meta', async () => {
    const res = await AddValuesNode.onMetaExecution(
      { values: [] },
      {
        dataset: {
          content: {
            schema: [
              {
                type: DataType.STRING,
                fallback: '',
                name: 'test',
                required: true,
                unique: true
              }
            ]
          },
          isPresent: true
        }
      },
      null
    );
    expect(res).toEqual({
      dataset: {
        content: {
          schema: [
            {
              type: DataType.STRING,
              fallback: '',
              name: 'test',
              required: true,
              unique: true
            }
          ]
        },
        isPresent: true
      }
    });
  });

  test('should add dynamic context outputs from context inputs without form', async () => {
    let res = await AddValuesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          isDynamic: false,
          displayName: 'Dataset'
        }
      },
      { dataset: { isPresent: true, content: { schema: [] } } },
      {
        test: {
          dataType: DataType.NUMBER,
          isDynamic: true,
          displayName: 'Test'
        }
      },
      {},
      { values: undefined },
      null
    );
    expect(res).toEqual({
      test: {
        dataType: DataType.NUMBER,
        isDynamic: true,
        displayName: 'Test'
      }
    });

    res = await AddValuesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          isDynamic: false,
          displayName: 'Dataset'
        }
      },
      { dataset: { isPresent: true, content: { schema: [] } } },
      {
        test: {
          dataType: DataType.NUMBER,
          isDynamic: true,
          displayName: 'Test'
        }
      },
      {},
      { values: [] },
      null
    );
    expect(res).toEqual({
      test: {
        dataType: DataType.NUMBER,
        isDynamic: true,
        displayName: 'Test'
      }
    });
  });

  test('should add dynamic context outputs from context inputs as well as from form', async () => {
    const res = await AddValuesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          isDynamic: false,
          displayName: 'Dataset'
        }
      },
      { dataset: { isPresent: true, content: { schema: [] } } },
      {
        test: {
          dataType: DataType.NUMBER,
          isDynamic: true,
          displayName: 'Test'
        }
      },
      {},
      {
        values: [
          {
            name: 'test2',
            fallback: '',
            required: true,
            type: DataType.STRING,
            unique: false
          }
        ]
      },
      null
    );
    expect(res).toEqual({
      test: {
        dataType: DataType.NUMBER,
        isDynamic: true,
        displayName: 'Test'
      },
      test2: {
        dataType: DataType.STRING,
        isDynamic: true,
        displayName: 'test2'
      }
    });
  });

  test('should return empty object for missing dataset input for context', async () => {
    const res = await AddValuesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          isDynamic: false,
          displayName: 'Dataset'
        }
      },
      { dataset: { isPresent: false, content: { schema: [] } } },
      {
        test: {
          dataType: DataType.NUMBER,
          isDynamic: true,
          displayName: 'Test'
        }
      },
      {},
      {
        values: [
          {
            name: 'test2',
            fallback: '',
            required: true,
            type: DataType.STRING,
            unique: false
          }
        ]
      },
      null
    );
    expect(res).toEqual({});
  });

  test('should add new value to dataset from StringInputNode', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const ds = await createDataset(db, 'test-ds');

    await addValueSchema(db, ds.id, {
      name: 'test',
      type: DataType.NUMBER,
      fallback: '0',
      unique: true,
      required: true
    });
    await createEntry(db, ds.id, { test: JSON.stringify(1) });

    const res = await AddValuesNode.onNodeExecution(
      {
        values: [
          {
            name: 'new',
            required: true,
            unique: true,
            fallback: '',
            type: DataType.STRING
          }
        ]
      },
      { dataset: { datasetId: ds.id } },
      {
        db,
        node: {
          id: VALID_OBJECT_ID,
          contextIds: [],
          inputs: [],
          outputs: [],
          type: AddValuesNode.name,
          workspaceId: ws.id,
          form: [],
          x: 0,
          y: 0
        },
        onContextFnExecution: async inputs => ({
          outputs: { ...inputs, new: 'super' }
        })
      }
    );

    expect(res.outputs.dataset.datasetId).toBeDefined();

    const all = await getAllEntries(db, res.outputs.dataset.datasetId);

    expect(all.length).toBe(1);
    expect(all[0].values).toEqual({ test: '1', new: 'super' });
  });

  test('should throw error for missing context function', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const ds = await createDataset(db, 'test-ds');

    await addValueSchema(db, ds.id, {
      name: 'test',
      type: DataType.NUMBER,
      fallback: '0',
      unique: true,
      required: true
    });

    await createEntry(db, ds.id, { test: JSON.stringify(1) });

    try {
      await AddValuesNode.onNodeExecution(
        {
          values: [
            {
              name: 'new',
              required: true,
              unique: true,
              fallback: '',
              type: DataType.STRING
            }
          ]
        },
        { dataset: { datasetId: ds.id } },
        {
          db,
          node: {
            id: VALID_OBJECT_ID,
            contextIds: [],
            inputs: [],
            outputs: [],
            type: AddValuesNode.name,
            workspaceId: ws.id,
            form: [],
            x: 0,
            y: 0
          }
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Missing context function');
    }
  });

  test('should throw error for invalid dataset input', async () => {
    try {
      await AddValuesNode.onNodeExecution(
        { values: [] },
        { dataset: { datasetId: VALID_OBJECT_ID } },
        { db, node: NODE }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset source');
    }
  });
});
