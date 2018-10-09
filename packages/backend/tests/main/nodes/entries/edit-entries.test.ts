import {
  allAreDefinedAndPresent,
  DataType,
  EditEntriesNodeDef,
  NodeState,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import { EditEntriesNode } from '../../../../src/main/nodes/entries/edit-entries';
import { VALID_OBJECT_ID } from '../../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../../src/main/nodes/entries/utils');
jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/workspace/entry');
jest.mock('../../../../src/main/calculation/utils');

describe('EditEntriesNode', () => {
  beforeEach(() => {
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

  test('should have absent meta', async () => {
    let res = await EditEntriesNode.onMetaExecution(
      { values: [] },
      { dataset: null },
      null
    );
    expect(res).toEqual({
      dataset: { content: { schema: [] }, isPresent: false }
    });

    res = await EditEntriesNode.onMetaExecution(
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

    let res = await EditEntriesNode.onMetaExecution(
      { values: undefined },
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

    res = await EditEntriesNode.onMetaExecution(
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
          schema: []
        },
        isPresent: true
      }
    });
  });

  test('should add dynamic context outputs from context inputs without form', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

    const res = await EditEntriesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          state: SocketState.STATIC,
          displayName: 'Dataset'
        }
      },
      { dataset: { isPresent: true, content: { schema: [] } } },
      {
        test: {
          dataType: DataType.NUMBER,
          state: SocketState.DYNAMIC,
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
        state: SocketState.DYNAMIC,
        displayName: 'Test'
      }
    });
  });

  test('should add dynamic context outputs from form if present and skip context inputs', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(true);

    const res = await EditEntriesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          state: SocketState.STATIC,
          displayName: 'Dataset'
        }
      },
      { dataset: { isPresent: true, content: { schema: [] } } },
      {
        test: {
          dataType: DataType.NUMBER,
          state: SocketState.DYNAMIC,
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
      test2: {
        dataType: DataType.STRING,
        state: SocketState.DYNAMIC,
        displayName: 'test2'
      }
    });
  });

  test('should return context inputs as well as dynamic inputs from form even with missing dataset input', async () => {
    const res = await EditEntriesNode.transformContextInputDefsToContextOutputDefs(
      {
        dataset: {
          dataType: DataType.DATASET,
          state: SocketState.STATIC,
          displayName: 'Dataset'
        }
      },
      { dataset: { isPresent: false, content: { schema: [] } } },
      {
        test: {
          dataType: DataType.NUMBER,
          state: SocketState.DYNAMIC,
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
      test2: { dataType: 'String', displayName: 'test2', state: 'Dynamic' }
    });
  });

  test('should add new value to dataset', async () => {
    const oldVS: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      fallback: '',
      unique: false,
      required: true
    };
    const entryA = { [oldVS.name]: 'foo' };
    const entryB = { [oldVS.name]: 'bar' };

    const res = await EditEntriesNode.onNodeExecution(
      {
        values: [
          oldVS,
          {
            name: 'new',
            required: true,
            unique: true,
            fallback: '',
            type: DataType.STRING
          }
        ]
      },
      { dataset: { entries: [entryA, entryB], schema: [oldVS] } },
      {
        reqContext: { db: null, userId: '' },
        node: {
          id: VALID_OBJECT_ID,
          contextIds: [],
          inputs: [],
          outputs: [],
          type: EditEntriesNode.type,
          workspaceId: VALID_OBJECT_ID,
          form: {},
          x: 0,
          y: 0,
          state: NodeState.VALID,
          variables: {}
        },
        contextFnExecution: async inputs => ({
          outputs: { ...inputs, new: 'super' }
        })
      }
    );

    expect(res.outputs.dataset.entries).toEqual([
      { new: 'super', test: 'foo' },
      { new: 'super', test: 'bar' }
    ]);
    expect(res.outputs.dataset.schema).toEqual([
      oldVS,
      {
        fallback: '',
        name: 'new',
        required: true,
        type: 'String',
        unique: true
      }
    ]);
    expect(res.results).toBeUndefined();
  });

  test('should use default schema', async () => {
    const oldVS: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      fallback: '',
      unique: false,
      required: true
    };
    const entryA = { [oldVS.name]: 'foo' };
    const entryB = { [oldVS.name]: 'bar' };

    const res = await EditEntriesNode.onNodeExecution(
      {
        values: null
      },
      { dataset: { entries: [entryA, entryB], schema: [oldVS] } },
      {
        reqContext: { db: null, userId: '' },
        node: {
          id: VALID_OBJECT_ID,
          contextIds: [],
          inputs: [],
          outputs: [],
          type: EditEntriesNode.type,
          workspaceId: VALID_OBJECT_ID,
          form: {},
          x: 0,
          y: 0,
          state: NodeState.VALID,
          variables: {}
        },
        contextFnExecution: async inputs => ({
          outputs: inputs
        })
      }
    );

    expect(res.outputs.dataset.entries).toEqual([
      { test: 'foo' },
      { test: 'bar' }
    ]);
    expect(res.outputs.dataset.schema).toEqual([oldVS]);
    expect(res.results).toBeUndefined();
  });

  test('should replace value to dataset', async () => {
    const oldVS: ValueSchema = {
      name: 'test',
      type: DataType.STRING,
      fallback: '',
      unique: false,
      required: true
    };
    const entryA = { [oldVS.name]: 'foo' };
    const entryB = { [oldVS.name]: 'bar' };

    const res = await EditEntriesNode.onNodeExecution(
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
      { dataset: { entries: [entryA, entryB], schema: [oldVS] } },
      {
        reqContext: { db: null, userId: '' },
        node: {
          id: VALID_OBJECT_ID,
          contextIds: [],
          inputs: [],
          outputs: [],
          type: EditEntriesNode.type,
          workspaceId: VALID_OBJECT_ID,
          form: {},
          x: 0,
          y: 0,
          state: NodeState.VALID,
          variables: {}
        },
        contextFnExecution: async () => ({
          outputs: { new: 'super' }
        })
      }
    );

    expect(res.outputs.dataset.entries).toEqual([
      { new: 'super' },
      { new: 'super' }
    ]);
    expect(res.outputs.dataset.schema).toEqual([
      {
        fallback: '',
        name: 'new',
        required: true,
        type: 'String',
        unique: true
      }
    ]);
    expect(res.results).toBeUndefined();
  });
});
