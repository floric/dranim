import {
  allAreDefinedAndPresent,
  DataType,
  DistinctEntriesNodeDef,
  SocketState
} from '@masterthesis/shared';

import { DistinctEntriesNode } from '../../../../src/main/nodes/entries/distinct-entries';
import { NODE } from '../../../test-utils';

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
        dataType: DataType.DATASET,
        displayName: 'Filtered Table',
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

  test('should call context function for distinct values but only for existing datasets', async () => {
    const contextFnExecution = jest.fn(e => ({
      outputs: {
        value: e.filteredDataset.entries
          .map(n => n.otherVal)
          .reduce((a, b) => a + b, 0),
        'source-distinct': e['source-distinct'],
        'destination-distinct': e['destination-distinct']
      }
    }));

    const res = await DistinctEntriesNode.onNodeExecution(
      {
        distinctSchemas: [
          {
            name: 'source',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          },
          {
            name: 'destination',
            type: DataType.STRING,
            fallback: '',
            required: true,
            unique: false
          }
        ],
        addedSchemas: [
          {
            name: 'count',
            type: DataType.NUMBER,
            fallback: '0',
            required: true,
            unique: false
          }
        ]
      },
      {
        dataset: {
          entries: [
            { source: 'a', destination: 'b', otherVal: 1 },
            { source: 'a', destination: 'b', otherVal: 4 },
            { source: 'a', destination: 'a', otherVal: 6 },
            { source: 'b', destination: 'a', otherVal: 3 },
            { source: 'b', destination: 'c', otherVal: 7 },
            { source: 'b', destination: 'c', otherVal: 3 },
            { source: 'c', destination: 'a', otherVal: 2 }
          ],
          schema: [
            {
              name: 'source',
              type: DataType.STRING,
              fallback: '',
              required: true,
              unique: false
            },
            {
              name: 'destination',
              type: DataType.STRING,
              fallback: '',
              required: true,
              unique: false
            },
            {
              name: 'otherVal',
              type: DataType.NUMBER,
              fallback: '0',
              required: true,
              unique: false
            }
          ]
        }
      },
      {
        node: NODE,
        reqContext: { db: null, userId: '' },
        contextFnExecution
      }
    );

    expect(contextFnExecution).toHaveBeenCalledWith({
      'destination-distinct': 'c',
      filteredDataset: {
        schema: [
          {
            fallback: '',
            name: 'source',
            required: true,
            type: 'String',
            unique: false
          },
          {
            fallback: '',
            name: 'destination',
            required: true,
            type: 'String',
            unique: false
          },
          {
            fallback: '0',
            name: 'otherVal',
            required: true,
            type: 'Number',
            unique: false
          }
        ],
        entries: [
          { destination: 'c', otherVal: 7, source: 'b' },
          { destination: 'c', otherVal: 3, source: 'b' }
        ]
      },
      'source-distinct': 'b'
    });
    expect(contextFnExecution).not.toHaveBeenCalledWith({
      'destination-distinct': 'c',
      filteredDataset: expect.anything(),
      'source-distinct': 'a'
    });

    expect(res).toEqual({
      outputs: {
        dataset: {
          entries: [
            {
              'destination-distinct': 'b',
              'source-distinct': 'a',
              value: 5
            },
            {
              'destination-distinct': 'a',
              'source-distinct': 'a',
              value: 6
            },
            {
              'destination-distinct': 'a',
              'source-distinct': 'b',
              value: 3
            },
            {
              'destination-distinct': 'c',
              'source-distinct': 'b',
              value: 10
            },
            {
              'destination-distinct': 'a',
              'source-distinct': 'c',
              value: 2
            }
          ],
          schema: [
            {
              fallback: '',
              name: 'source-distinct',
              required: true,
              type: 'String',
              unique: false
            },
            {
              fallback: '',
              name: 'destination-distinct',
              required: true,
              type: 'String',
              unique: false
            },
            {
              fallback: '0',
              name: 'count',
              required: true,
              type: 'Number',
              unique: false
            }
          ]
        }
      }
    });
  });
});
