import {
  allAreDefinedAndPresent,
  Dataset,
  DatasetSocket,
  DataType,
  Entry,
  FilterEntriesNodeDef,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import { createUniqueDatasetName } from '../../../../src/main/calculation/utils';
import { FilterEntriesNode } from '../../../../src/main/nodes/entries/filter-entries';
import {
  getDynamicEntryContextInputs,
  processEntries
} from '../../../../src/main/nodes/entries/utils';
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

describe('FilterEntriesNode', () => {
  beforeEach(() => {
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
      created: '',
      description: '',
      valueschemas: [],
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
    (createUniqueDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (processEntries as jest.Mock).mockImplementation(() => Promise.resolve());
    (tryGetDataset as jest.Mock).mockResolvedValue(oldDs);
    (createDataset as jest.Mock).mockResolvedValue(newDs);

    const res = await FilterEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: oldDs.id } },
      {
        reqContext: { db: null, userId: '' },
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
      { db: null, userId: '' }
    );

    expect(res.dataset).toEqual(validDs);
  });

  test('should return empty object on onMetaExecution', async () => {
    let res = await FilterEntriesNode.onMetaExecution(
      {},
      { dataset: null },
      { db: null, userId: '' }
    );
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);

    res = await FilterEntriesNode.onMetaExecution(
      {},
      { dataset: undefined },
      { db: null, userId: '' }
    );
    expect(res.dataset.isPresent).toBe(false);
    expect(res.dataset.content.schema).toEqual([]);
  });

  test('should call getDynamicEntryContextInputs', async () => {
    (getDynamicEntryContextInputs as jest.Mock).mockReturnValue({});
    const res = await FilterEntriesNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: { content: { schema: [] }, isPresent: true } },
      {},
      { db: null, userId: '' }
    );
    expect(res).toEqual({});
    expect(getDynamicEntryContextInputs as jest.Mock).toHaveBeenCalledTimes(1);
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
      {},
      { db: null, userId: '' }
    );

    const res = await FilterEntriesNode.transformContextInputDefsToContextOutputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: validDs },
      inputRes,
      {},
      [],
      { db: null, userId: '' }
    );

    expect(res).toEqual({
      keepEntry: {
        dataType: DataType.BOOLEAN,
        displayName: 'Keep entry',
        state: SocketState.STATIC
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
<<<<<<< HEAD
      created: '',
      description: '',
=======
>>>>>>> master
      valueschemas: [vs],
      name: 'Old DS',
      workspaceId: 'CDE'
    };
    const newDs: Dataset = {
      id: 'ABC',
<<<<<<< HEAD
      created: '',
      description: '',
=======
>>>>>>> master
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
    (createUniqueDatasetName as jest.Mock).mockReturnValue('EditEntries-123');
    (tryGetDataset as jest.Mock).mockResolvedValue(oldDs);
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
        reqContext: { db: null, userId: '' },
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
      { db: null, userId: '' }
    );
    expect(createEntry as jest.Mock).toHaveBeenCalledWith(
      newDs.id,
      {
        [vs.name]: 2
      },
      { db: null, userId: '' }
    );
  });

  test('should throw errors for missing context', async () => {
    (tryGetDataset as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown dataset source');
    });
    try {
      await FilterEntriesNode.onNodeExecution(
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
