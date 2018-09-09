import {
  allAreDefinedAndPresent,
  Dataset,
  DataType,
  EditEntriesNodeDef,
  Entry,
  NodeState,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import { createUniqueDatasetName } from '../../../../src/main/calculation/utils';
import { EditEntriesNode } from '../../../../src/main/nodes/entries/edit-entries';
import { processEntries } from '../../../../src/main/nodes/entries/utils';
import {
  createDataset,
  tryGetDataset
} from '../../../../src/main/workspace/dataset';
import { createEntry } from '../../../../src/main/workspace/entry';
import { NeverGoHereError, NODE, VALID_OBJECT_ID } from '../../../test-utils';

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
    const oldDs: Dataset = {
      id: VALID_OBJECT_ID,
      created: '',
      description: '',
      valueschemas: [oldVS],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'ABC',
      created: '',
      description: '',
      valueschemas: [],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    const entryA: Entry = {
      id: 'eA',
      values: { [oldVS.name]: 'foo' }
    };
    (createUniqueDatasetName as jest.Mock).mockReturnValue('AddEntries');
    (processEntries as jest.Mock).mockImplementation(async (a, b, processFn) =>
      processFn(entryA)
    );
    (tryGetDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);
    (createEntry as jest.Mock).mockResolvedValue({});

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
      { dataset: { datasetId: oldDs.id } },
      {
        reqContext: { db: null, userId: '' },
        node: {
          id: VALID_OBJECT_ID,
          contextIds: [],
          inputs: [],
          outputs: [],
          type: EditEntriesNode.type,
          workspaceId: VALID_OBJECT_ID,
          form: [],
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

    expect(res.outputs.dataset.datasetId).toBe(newDs.id);
    expect(createEntry as jest.Mock).toHaveBeenCalledTimes(1);
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(
      newDs.id,
      {
        [oldVS.name]: 'foo',
        new: 'super'
      },
      { db: null, userId: '' }
    );
  });

  test('should throw error for invalid dataset input', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset source');
    });
    try {
      await EditEntriesNode.onNodeExecution(
        { values: [] },
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
