import {
  allAreDefinedAndPresent,
  Dataset,
  DatasetSocket,
  DataType,
  FilterEntriesNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../../../src/main/calculation/utils';
import { FilterEntriesNode } from '../../../../src/main/nodes/entries/filter-entries';
import { processEntries } from '../../../../src/main/nodes/entries/utils';
import {
  createDataset,
  getDataset
} from '../../../../src/main/workspace/dataset';
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
jest.mock('../../../../src/main/calculation/utils');

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
    expect(FilterEntriesNode.type).toBe(FilterEntriesNodeDef.type);
    expect(FilterEntriesNode.isFormValid).toBeUndefined();
    expect(FilterEntriesNode.isInputValid).toBeUndefined();
    expect(
      FilterEntriesNode.transformContextInputDefsToContextOutputDefs
    ).toBeDefined();
    expect(
      FilterEntriesNode.transformInputDefsToContextInputDefs
    ).toBeDefined();
  });

  test('should create new DS and do changes on this one', async () => {
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
    (createDynamicDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (processEntries as jest.Mock).mockImplementation(() => Promise.resolve());
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    const res = await FilterEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: oldDs.id } },
      {
        db,
        node: NODE,
        contextFnExecution: () =>
          Promise.resolve({ outputs: { keepEntry: true } })
      }
    );
    expect(res.outputs.dataset.datasetId).toBe(newDs.id);
    expect(res.results).toBeUndefined();
  });

  test('should passthrough defs on onMetaExecution', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

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

  test('should use dataset schemas as dynamic inputs of context fn', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

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
    (createDynamicDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (processEntries as jest.Mock).mockImplementation(() => Promise.resolve());
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    const res = await FilterEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: oldDs.id } },
      {
        db,
        node: NODE,
        contextFnExecution: input =>
          Promise.resolve({
            outputs: { keepEntry: input.val < 10 }
          })
      }
    );
    expect(res.outputs.dataset).toBeDefined();
  });

  test('should throw errors for missing context', async () => {
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
    (createDynamicDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (processEntries as jest.Mock).mockImplementation(() => Promise.resolve());
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    try {
      await FilterEntriesNode.onNodeExecution(
        {},
        { dataset: { datasetId: oldDs.id } },
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
        {
          db,
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset source');
    }
  });
});
