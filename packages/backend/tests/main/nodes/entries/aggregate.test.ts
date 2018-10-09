import {
  AggregateEntriesNodeDef,
  AggregationEntriesType,
  Dataset,
  DataType,
  ValueSchema
} from '@masterthesis/shared';

import { AggregateEntriesNode } from '../../../../src/main/nodes/entries/aggregate';
import { tryGetDataset } from '../../../../src/main/workspace/dataset';
import { getEntryCollection } from '../../../../src/main/workspace/entry';

jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/workspace/entry');

const schema: Array<ValueSchema> = [
  {
    name: 'abc',
    type: DataType.NUMBER,
    unique: false,
    required: true,
    fallback: '9'
  }
];

describe('AggregateEntriesNode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should have correct properties', () => {
    expect(AggregateEntriesNode.type).toBe(AggregateEntriesNodeDef.type);
    expect(AggregateEntriesNode.isFormValid).toBeUndefined();
    expect(AggregateEntriesNode.isInputValid).toBeUndefined();
  });

  test('should get average', async () => {
    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.AVG, valueName: 'abc' },
      { dataset: { entries: [{ abc: 1 }, { abc: 2 }, { abc: 3 }], schema } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: 2 } });
  });

  test('should get minimum', async () => {
    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.MIN, valueName: 'abc' },
      { dataset: { entries: [{ abc: 1 }, { abc: -2 }, { abc: 9 }], schema } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: -2 } });
  });

  test('should get maximum', async () => {
    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.MAX, valueName: 'abc' },
      { dataset: { entries: [{ abc: 1 }, { abc: -2 }, { abc: 9 }], schema } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: 9 } });
  });

  test('should get sum', async () => {
    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.SUM, valueName: 'abc' },
      { dataset: { entries: [{ abc: 1 }, { abc: -2 }, { abc: 9 }], schema } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: 8 } });
  });

  test('should throw error for missing schema', async () => {
    const ds: Dataset = {
      id: '1',
      userId: '',
      created: '',
      description: '',
      name: 'name',
      workspaceId: '1',
      valueschemas: []
    };
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);
    (getEntryCollection as jest.Mock).mockReturnValue({
      aggregate: () => ({
        next: () => ({
          value: 1
        })
      })
    });

    try {
      await AggregateEntriesNode.onNodeExecution(
        { type: AggregationEntriesType.SUM, valueName: 'abc' },
        { dataset: { schema: [], entries: [{ abc: 9 }] } },
        { node: null, reqContext: { db: null, userId: '' } }
      );
    } catch (err) {
      expect(err.message).toBe('Schema missing in Entries');
    }
  });

  test('should throw error for wrong datatype', async () => {
    try {
      await AggregateEntriesNode.onNodeExecution(
        { type: AggregationEntriesType.SUM, valueName: 'abc' },
        {
          dataset: {
            entries: [{ abc: 9 }],
            schema: [
              {
                name: 'abc',
                fallback: '',
                required: false,
                unique: false,
                type: DataType.STRING
              }
            ]
          }
        },
        { node: null, reqContext: { db: null, userId: '' } }
      );
    } catch (err) {
      expect(err.message).toBe(
        'Aggregation methods only supported for numeric fields'
      );
    }
  });

  test('should have invalid meta', async () => {
    let res = await AggregateEntriesNode.onMetaExecution(
      { type: AggregationEntriesType.AVG, valueName: 'abc' },
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await AggregateEntriesNode.onMetaExecution(
      { type: AggregationEntriesType.AVG, valueName: 'abc' },
      { dataset: null },
      { db: null, userId: '' }
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should have valid meta', async () => {
    const res = await AggregateEntriesNode.onMetaExecution(
      { type: AggregationEntriesType.AVG, valueName: 'abc' },
      { dataset: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
