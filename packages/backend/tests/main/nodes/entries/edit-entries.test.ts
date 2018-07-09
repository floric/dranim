import {
  allAreDefinedAndPresent,
  Dataset,
  DatasetSocket,
  DataType,
  EditEntriesNodeDef,
  SocketState
} from '@masterthesis/shared';

import { createDynamicDatasetName } from '../../../../src/main/calculation/utils';
import { EditEntriesNode } from '../../../../src/main/nodes/entries/edit-entries';
import {
  getDynamicEntryContextInputs,
  processEntries
} from '../../../../src/main/nodes/entries/utils';
import {
  createDataset,
  tryGetDataset
} from '../../../../src/main/workspace/dataset';
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
    (processEntries as jest.Mock).mockImplementation(n => Promise.resolve());
    (tryGetDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    const res = await EditEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: oldDs.id } },
      {
        reqContext: { db: null, userId: '' },
        node: NODE,
        contextFnExecution: () => Promise.resolve({ outputs: {} })
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
    const res = await EditEntriesNode.onMetaExecution(
      {},
      { dataset: validDs },
      { db: null, userId: '' }
    );

    expect(res.dataset).toEqual(validDs);
  });

  test('should return empty object on onMetaExecution', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(false);

    let res = await EditEntriesNode.onMetaExecution(
      {},
      { dataset: null },
      { db: null, userId: '' }
    );
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);

    res = await EditEntriesNode.onMetaExecution(
      {},
      { dataset: undefined },
      { db: null, userId: '' }
    );
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);
  });

  test('should use dataset schemas as dynamic inputs of context fn', async () => {
    (getDynamicEntryContextInputs as jest.Mock).mockReturnValue({
      super: {
        dataType: DataType.BOOLEAN,
        displayName: 'super',
        state: SocketState.DYNAMIC
      }
    });
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

    const res = await EditEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      {},
      { db: null, userId: '' }
    );

    expect(res).toEqual({
      super: {
        dataType: DataType.BOOLEAN,
        displayName: 'super',
        state: SocketState.DYNAMIC
      }
    });
  });

  test('should return empty object for missing inputs', async () => {
    (allAreDefinedAndPresent as jest.Mock).mockReturnValue(false);

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

    const res = await EditEntriesNode.transformContextInputDefsToContextOutputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      {
        super: {
          dataType: DataType.BOOLEAN,
          displayName: 'super',
          state: SocketState.DYNAMIC
        }
      },
      {},
      [],
      { db: null, userId: '' }
    );

    expect(res).toEqual({});
  });

  test('should passthrough dynamic inputs of context input node', async () => {
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

    const res = await EditEntriesNode.transformContextInputDefsToContextOutputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      {
        super: {
          dataType: DataType.BOOLEAN,
          displayName: 'super',
          state: SocketState.DYNAMIC
        }
      },
      {},
      [],
      { db: null, userId: '' }
    );

    expect(res).toEqual({
      super: {
        dataType: DataType.BOOLEAN,
        displayName: 'super',
        state: SocketState.DYNAMIC
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
    (processEntries as jest.Mock).mockImplementation(n => Promise.resolve());
    (tryGetDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    const res = await EditEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: oldDs.id } },
      {
        reqContext: { db: null, userId: '' },
        node: NODE,
        contextFnExecution: input => Promise.resolve({ outputs: { val: ':)' } })
      }
    );
    expect(res.outputs.dataset).toBeDefined();
    expect(newDs.valueschemas).toEqual(oldDs.valueschemas);
  });

  test('should throw error for invalid dataset', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset source');
    });
    try {
      await EditEntriesNode.onNodeExecution(
        {},
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
