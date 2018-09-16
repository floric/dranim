import {
  allAreDefinedAndPresent,
  Dataset,
  DatasetSocket,
  DataType,
  FilterEntriesNodeDef,
  SocketState,
  ValueSchema
} from '@masterthesis/shared';

import { FilterEntriesNode } from '../../../../src/main/nodes/entries/filter-entries';
import { getDynamicEntryContextInputs } from '../../../../src/main/nodes/entries/utils';
import { tryGetDataset } from '../../../../src/main/workspace/dataset';
import { NeverGoHereError, NODE } from '../../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../../src/main/nodes/entries/utils');
jest.mock('../../../../src/main/workspace/dataset');
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

  test('should filter entries', async () => {
    const res = await FilterEntriesNode.onNodeExecution(
      {},
      {
        dataset: {
          entries: [{ test: 9 }],
          schema: [
            {
              name: 'test',
              unique: false,
              required: false,
              fallback: '',
              type: DataType.NUMBER
            }
          ]
        }
      },
      {
        reqContext: { db: null, userId: '' },
        node: NODE,
        contextFnExecution: () =>
          Promise.resolve({ outputs: { keepEntry: true } })
      }
    );
    expect(res.outputs.dataset.entries).toEqual([{ test: 9 }]);
    expect(res.outputs.dataset.schema).toEqual([
      {
        name: 'test',
        unique: false,
        required: false,
        fallback: '',
        type: DataType.NUMBER
      }
    ]);
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
    const newDs: Dataset = {
      id: 'ABC',
      created: '',
      description: '',
      valueschemas: [],
      name: 'New DS',
      workspaceId: 'CDE'
    };
    const entryA = { [vs.name]: 1 };
    const entryB = { [vs.name]: 15 };
    const entryC = { [vs.name]: 2 };

    const res = await FilterEntriesNode.onNodeExecution(
      {},
      { dataset: { entries: [entryA, entryB, entryC], schema: [vs] } },
      {
        reqContext: { db: null, userId: '' },
        node: NODE,
        contextFnExecution: input =>
          Promise.resolve({
            outputs: { keepEntry: input.val < 10 }
          })
      }
    );
    expect(res.outputs.dataset.entries).toEqual([{ val: 1 }, { val: 2 }]);
  });
});
