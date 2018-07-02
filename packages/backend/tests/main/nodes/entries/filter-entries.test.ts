import {
  allAreDefinedAndPresent,
  Dataset,
  DatasetSocket,
  DataType,
  Entry,
  FilterEntriesNodeDef,
  ValueSchema
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createDynamicDatasetName } from '../../../../src/main/calculation/utils';
import { FilterEntriesNode } from '../../../../src/main/nodes/entries/filter-entries';
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
        reqContext: { db, userId: '' },
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
      { db, userId: '' }
    );

    expect(res.dataset).toEqual(validDs);
  });

  test('should return empty object on onMetaExecution', async () => {
    let res = await FilterEntriesNode.onMetaExecution(
      {},
      { dataset: null },
      { db, userId: '' }
    );
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);

    res = await FilterEntriesNode.onMetaExecution(
      {},
      { dataset: undefined },
      { db, userId: '' }
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
      { db, userId: '' }
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
      { db, userId: '' }
    );
    expect(res).toEqual({});

    res = await FilterEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: null },
      { db, userId: '' }
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
      { db, userId: '' }
    );

    const res = await FilterEntriesNode.transformContextInputDefsToContextOutputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      inputRes,
      {},
      [],
      { db, userId: '' }
    );

    expect(res).toEqual({
      keepEntry: {
        dataType: DataType.BOOLEAN,
        displayName: 'Keep entry'
      }
    });
  });

  test('should filter entries', async () => {
    const vs: ValueSchema = {
      name: 'val',
      type: DataType.NUMBER,
      fallback: '',
      unique: false,
      required: true
    };
    const oldDs: Dataset = {
      id: VALID_OBJECT_ID,
      entriesCount: 0,
      latestEntries: [],
      valueschemas: [vs],
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
      values: { [vs.name]: 1 }
    };
    const entryB: Entry = {
      id: 'eB',
      values: { [vs.name]: 15 }
    };
    const entryC: Entry = {
      id: 'eC',
      values: { [vs.name]: 2 }
    };
    (createDynamicDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (getDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);
    (processEntries as jest.Mock).mockImplementation(
      async (a, b, processFn) => {
        await processFn(entryA);
        await processFn(entryB);
        await processFn(entryC);
      }
    );

    const res = await FilterEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: oldDs.id } },
      {
        reqContext: { db, userId: '' },
        node: NODE,
        contextFnExecution: input =>
          Promise.resolve({
            outputs: { keepEntry: input.val < 10 }
          })
      }
    );
    expect(res.outputs.dataset.datasetId).toBe(newDs.id);
    expect(createEntry as jest.Mock).toHaveBeenCalledTimes(2);
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(
      newDs.id,
      {
        [vs.name]: 1
      },
      { db, userId: '' }
    );
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(
      newDs.id,
      {
        [vs.name]: 2
      },
      { db, userId: '' }
    );
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
          reqContext: { db, userId: '' },
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
