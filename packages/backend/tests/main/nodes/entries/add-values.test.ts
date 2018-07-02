import {
  AddValuesNodeDef,
  allAreDefinedAndPresent,
  Dataset,
  DataType,
  Entry,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../../../src/main/calculation/utils';
import { AddValuesNode } from '../../../../src/main/nodes/entries/add-values';
import { processEntries } from '../../../../src/main/nodes/entries/utils';
import {
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
import { createEntry } from '../../../../src/main/workspace/entry';
import {
  getTestMongoDb,
  NeverGoHereError,
  NODE,
  VALID_OBJECT_ID
} from '../../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('@masterthesis/shared');
jest.mock('../../../../src/main/nodes/entries/utils');
jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/workspace/entry');
jest.mock('../../../../src/main/calculation/utils');

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
    expect(AddValuesNode.type).toBe(AddValuesNodeDef.type);
    expect(AddValuesNode.isFormValid).toBeDefined();
    expect(AddValuesNode.isInputValid).toBeUndefined();
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
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

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
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

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
  });

  test('should add dynamic context outputs from context inputs as well as from form', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

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

  test('should add new value to dataset', async () => {
    const oldVS: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      fallback: '',
      unique: false,
      required: true
    };
    const oldDs: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [oldVS],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'ABC',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    const entryA: Entry = {
      id: 'eA',
      values: { [oldVS.name]: 'foo' }
    };
    (createDynamicDatasetName as jest.Mock).mockReturnValue('AddEntries');
    (processEntries as jest.Mock).mockImplementation(async (a, b, processFn) =>
      processFn(entryA)
    );
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);
    (createEntry as jest.Mock).mockResolvedValue({});

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
      { dataset: { datasetId: oldDs.id } },
      {
        reqContext: { db, userId: '' },
        node: {
          id: VALID_OBJECT_ID,
          contextIds: [],
          inputs: [],
          outputs: [],
          type: AddValuesNode.type,
          workspaceId: VALID_OBJECT_ID,
          form: [],
          x: 0,
          y: 0
        },
        contextFnExecution: async inputs => ({
          outputs: { ...inputs, new: 'super' }
        })
      }
    );

    expect(res.outputs.dataset.datasetId).toBe(newDs.id);
    expect(createEntry as jest.Mock).toHaveBeenCalledTimes(1);
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(
      newDs.id,
      {
        [oldVS.name]: 'foo',
        new: 'super'
      },
      { db, userId: '' }
    );
  });

  test('should throw error for missing context function', async () => {
    const oldDs: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'ABC',
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    (createDynamicDatasetName as jest.Mock).mockReturnValue('AddEntries-123');
    (processEntries as jest.Mock).mockImplementation(() => Promise.resolve());
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

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
        { dataset: { datasetId: oldDs.id } },
        {
          reqContext: { db, userId: '' },
          node: {
            id: VALID_OBJECT_ID,
            contextIds: [],
            inputs: [],
            outputs: [],
            type: AddValuesNode.type,
            workspaceId: VALID_OBJECT_ID,
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
        {
          reqContext: { db, userId: '' },
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset source');
    }
  });
});
