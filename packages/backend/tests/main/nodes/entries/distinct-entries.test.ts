import {
  allAreDefinedAndPresent,
  Dataset,
  DataType,
  DistinctEntriesNodeDef,
  SocketState
} from '@masterthesis/shared';

import { createUniqueDatasetName } from '../../../../src/main/calculation/utils';
import { DistinctEntriesNode } from '../../../../src/main/nodes/entries/distinct-entries';
import { processDocumentsWithCursor } from '../../../../src/main/nodes/entries/utils';
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
jest.mock('../../../../src/main/nodes/entries/utils');

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
      addedSchemas: [],
      distinctSchemas: null
    });
    expect(res).toBe(false);

    res = await DistinctEntriesNode.isFormValid({
      addedSchemas: [],
      distinctSchemas: []
    });
    expect(res).toBe(false);

    res = await DistinctEntriesNode.isFormValid({
      addedSchemas: null,
      distinctSchemas: [
        {
          name: 'y',
          type: DataType.NUMBER,
          fallback: '',
          required: true,
          unique: false
        }
      ]
    });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    const res = await DistinctEntriesNode.isFormValid({
      addedSchemas: [],
      distinctSchemas: [
        {
          name: 'y',
          type: DataType.NUMBER,
          fallback: '',
          required: true,
          unique: false
        }
      ]
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
    const addedSchemas = [
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
      { distinctSchemas: null, addedSchemas },
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
      { distinctSchemas: null, addedSchemas: null },
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
      { distinctSchemas: null, addedSchemas: [] },
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
        distinctSchemas: [
          {
            name: 'test',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          }
        ],
        addedSchemas: []
      },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      filteredDataset: {
        dataType: 'Dataset',
        displayName: 'Filtered Dataset',
        state: 'Dynamic'
      },
      'test-distinct': {
        dataType: 'String',
        displayName: 'test-distinct',
        state: 'Dynamic'
      }
    });
  });

  test('should have absent metas', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(false);
    let res = await DistinctEntriesNode.onMetaExecution(
      {
        distinctSchemas: null,
        addedSchemas: null
      },
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DistinctEntriesNode.onMetaExecution(
      {
        distinctSchemas: [
          {
            name: 'test',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          }
        ],
        addedSchemas: []
      },
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DistinctEntriesNode.onMetaExecution(
      {
        distinctSchemas: null,
        addedSchemas: []
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
        distinctSchemas: [
          {
            name: 'test',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          }
        ],
        addedSchemas: null
      },
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await DistinctEntriesNode.onMetaExecution(
      {
        distinctSchemas: null,
        addedSchemas: []
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
        distinctSchemas: [
          {
            name: 'test',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          }
        ],
        addedSchemas: [
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
    const contextFnExecution = jest.fn(() => ({
      outputs: { test: 'abc', 'other-test': 2 }
    }));

    const res = await DistinctEntriesNode.onNodeExecution(
      {
        distinctSchemas: [
          {
            name: 'test',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          }
        ],
        addedSchemas: [
          {
            name: 'other-test',
            type: DataType.NUMBER,
            fallback: '9',
            required: true,
            unique: false
          }
        ]
      },
      { dataset: { entries: [], schema: [] } },
      {
        node: NODE,
        reqContext: { db: null, userId: '' },
        contextFnExecution
      }
    );
  });
});
