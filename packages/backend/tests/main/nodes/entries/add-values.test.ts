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
        { dataType: DataType.STRING, displayName: 'test', isDynamic: true }
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
          { displayName: 'test2', isDynamic: true, dataType: DataType.STRING }
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
});
