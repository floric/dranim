import {
  allAreDefinedAndPresent,
  Dataset,
  DataType,
  DistinctEntriesNodeDef,
  SocketState
} from '@masterthesis/shared';

import { createDynamicDatasetName } from '../../../../src/main/calculation/utils';
import { DistinctEntriesNode } from '../../../../src/main/nodes/entries/distinct-entries';
import {
  createDataset,
  tryGetDataset
} from '../../../../src/main/workspace/dataset';
import {
  createEntry,
  getEntryCollection
} from '../../../../src/main/workspace/entry';
import { NeverGoHereError, NODE, VALID_OBJECT_ID } from '../../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/calculation/utils');
jest.mock('../../../../src/main/workspace/entry');

describe('DistinctEntriesNode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should have correct properties', () => {
    expect(DistinctEntriesNode.type).toBe(DistinctEntriesNodeDef.type);
    expect(DistinctEntriesNode.isFormValid).toBeDefined();
    expect(DistinctEntriesNode.isInputValid).toBeUndefined();
    expect(
      DistinctEntriesNode.transformContextInputDefsToContextOutputDefs
    ).toBeDefined();
    expect(
      DistinctEntriesNode.transformInputDefsToContextInputDefs
    ).toBeDefined();
  });

  test('should have invalid form', async () => {
    let res = await DistinctEntriesNode.isFormValid({
      newSchemas: [],
      schema: null
    });
    expect(res).toBe(false);

    res = await DistinctEntriesNode.isFormValid({
      newSchemas: null,
      schema: {
        name: 'y',
        type: DataType.NUMBER,
        fallback: '',
        required: true,
        unique: false
      }
    });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    const res = await DistinctEntriesNode.isFormValid({
      newSchemas: [],
      schema: {
        name: 'y',
        type: DataType.NUMBER,
        fallback: '',
        required: true,
        unique: false
      }
    });
    expect(res).toBe(true);
  });

  test('should get context outputs from form and contextinputs', async () => {
    const contextInputDefs = {
      abc: {
        displayName: 'test',
        dataType: DataType.STRING,
        state: SocketState.DYNAMIC
      }
    };
    const newSchemas = [
      {
        name: 'y',
        type: DataType.NUMBER,
        fallback: '',
        required: true,
        unique: false
      },
      {
        name: 'x',
        type: DataType.DATETIME,
        fallback: '',
        required: true,
        unique: false
      }
    ];

    const res = await DistinctEntriesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          displayName: 'ds',
          state: SocketState.STATIC
        }
      },
      { dataset: { content: { schema: [] }, isPresent: true } },
      contextInputDefs,
      {},
      { schema: null, newSchemas },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      abc: {
        dataType: 'String',
        displayName: 'test',
        state: SocketState.DYNAMIC
      },
      x: { dataType: 'Datetime', displayName: 'x', state: SocketState.DYNAMIC },
      y: { dataType: 'Number', displayName: 'y', state: SocketState.DYNAMIC }
    });
  });

  test('should get context outputs from form and contextinputs 2', async () => {
    const contextInputDefs = {
      abc: {
        displayName: 'test',
        dataType: DataType.STRING,
        state: SocketState.DYNAMIC
      }
    };

    const res = await DistinctEntriesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          displayName: 'ds',
          state: SocketState.STATIC
        }
      },
      { dataset: { content: { schema: [] }, isPresent: true } },
      contextInputDefs,
      {},
      { schema: null, newSchemas: null },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      abc: {
        dataType: 'String',
        displayName: 'test',
        state: SocketState.DYNAMIC
      }
    });
  });

  test('should have empty context inputs for missing schema in form', async () => {
    const res = await DistinctEntriesNode.transformInputDefsToContextInputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          displayName: 'ds',
          state: SocketState.STATIC
        }
      },
      { dataset: { isPresent: true, content: { schema: [] } } },
      { schema: null, newSchemas: [] },
      { db: null, userId: '' }
    );
    expect(res).toEqual({});
  });

  test('should get context inputs from schema in form', async () => {
    const res = await DistinctEntriesNode.transformInputDefsToContextInputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          displayName: 'ds',
          state: SocketState.STATIC
        }
      },
      { dataset: { isPresent: true, content: { schema: [] } } },
      {
        schema: {
          name: 'test',
          type: DataType.STRING,
          fallback: '',
          required: true,
          unique: false
        },
        newSchemas: []
      },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      'test-distinct': {
        dataType: 'String',
        displayName: 'test-distinct',
        state: SocketState.DYNAMIC
      }
    });
  });

  test('should have absent metas', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(false);
    let res = await DistinctEntriesNode.onMetaExecution(
      {
        schema: null,
        newSchemas: null
      },
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DistinctEntriesNode.onMetaExecution(
      {
        schema: {
          name: 'test',
          type: DataType.STRING,
          fallback: '',
          required: true,
          unique: false
        },
        newSchemas: []
      },
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DistinctEntriesNode.onMetaExecution(
      {
        schema: null,
        newSchemas: []
      },
      { dataset: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });
  });

  test('should have absent metas 2', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);
    let res = await DistinctEntriesNode.onMetaExecution(
      {
        schema: {
          name: 'test',
          type: DataType.STRING,
          fallback: '',
          required: true,
          unique: false
        },
        newSchemas: null
      },
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DistinctEntriesNode.onMetaExecution(
      {
        schema: null,
        newSchemas: []
      },
      { dataset: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });
  });

  test('should have present metas', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);
    const res = await DistinctEntriesNode.onMetaExecution(
      {
        schema: {
          name: 'test',
          type: DataType.STRING,
          fallback: '',
          required: true,
          unique: false
        },
        newSchemas: [
          {
            name: 'y',
            type: DataType.NUMBER,
            fallback: '',
            required: true,
            unique: false
          },
          {
            name: 'x',
            type: DataType.DATETIME,
            fallback: '',
            required: true,
            unique: false
          }
        ]
      },
      { dataset: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: {
        content: {
          schema: [
            {
              name: 'test-distinct',
              type: DataType.STRING,
              fallback: '',
              required: true,
              unique: false
            },
            {
              name: 'y',
              type: DataType.NUMBER,
              fallback: '',
              required: true,
              unique: false
            },
            {
              name: 'x',
              type: DataType.DATETIME,
              fallback: '',
              required: true,
              unique: false
            }
          ]
        },
        isPresent: true
      }
    });
  });

  test('should call context function for distinct values', async () => {
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
    (createDynamicDatasetName as jest.Mock).mockReturnValue('123');
    (tryGetDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);
    (createEntry as jest.Mock).mockImplementation(jest.fn);
    (getEntryCollection as jest.Mock).mockReturnValue({
      aggregate: jest.fn(() => {
        let entriesToProces = 20;
        return {
          close: async () => true,
          next: async () => ({ _id: 'distinct-value' }),
          hasNext: async () => {
            if (entriesToProces === 0) {
              return false;
            }

            entriesToProces -= 1;
            return true;
          }
        };
      })
    });

    const contextFnExecution = jest.fn(() => ({
      outputs: { test: 'abc', 'other-test': 2 }
    }));

    const res = await DistinctEntriesNode.onNodeExecution(
      {
        schema: {
          name: 'test',
          type: DataType.STRING,
          fallback: '',
          required: true,
          unique: false
        },
        newSchemas: [
          {
            name: 'other-test',
            type: DataType.NUMBER,
            fallback: '9',
            required: true,
            unique: false
          }
        ]
      },
      { dataset: { datasetId: '123' } },
      {
        node: NODE,
        reqContext: { db: null, userId: '' },
        contextFnExecution
      }
    );

    expect(getEntryCollection(oldDs.id, null).aggregate).toHaveBeenCalledTimes(
      1
    );
    expect(contextFnExecution).toHaveBeenCalledWith({
      'test-distinct': 'distinct-value'
    });
    expect(createEntry as jest.Mock).toHaveBeenCalledTimes(20);
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(
      newDs.id,
      { 'other-test': 2, test: 'abc' },
      {
        db: null,
        userId: ''
      }
    );
    expect(res).toEqual({
      outputs: {
        dataset: {
          datasetId: 'ABC'
        }
      }
    });
  });

  test('should throw error for invalid dataset', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset source');
    });

    try {
      await DistinctEntriesNode.onNodeExecution(
        {
          schema: {
            name: 'test',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          },
          newSchemas: []
        },
        { dataset: { datasetId: VALID_OBJECT_ID } },
        {
          reqContext: { db: null, userId: '' },
          node: NODE
        }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown dataset source');
    }
  });
});
