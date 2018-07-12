import {
  AggregateEntriesNodeDef,
  AggregationEntriesType,
  Dataset,
  DataType
} from '@masterthesis/shared';

import { AggregateEntriesNode } from '../../../../src/main/nodes/entries/aggregate';
import { tryGetDataset } from '../../../../src/main/workspace/dataset';
import { getEntryCollection } from '../../../../src/main/workspace/entry';
import { NeverGoHereError } from '../../../test-utils';

jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/workspace/entry');

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
    const ds: Dataset = {
      id: '1',
      name: 'name',
      workspaceId: '1',
      valueschemas: [
        {
          name: 'abc',
          type: DataType.NUMBER,
          required: true,
          unique: false,
          fallback: '0'
        }
      ]
    };
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);
    (getEntryCollection as jest.Mock).mockReturnValue({
      aggregate: () => ({
        next: () => ({
          value: 1
        })
      })
    });

    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.AVG, valueName: 'abc' },
      { dataset: { datasetId: '1' } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: 1 } });
  });

  test('should get minimum', async () => {
    const ds: Dataset = {
      id: '1',
      name: 'name',
      workspaceId: '1',
      valueschemas: [
        {
          name: 'abc',
          type: DataType.NUMBER,
          required: true,
          unique: false,
          fallback: '0'
        }
      ]
    };
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);
    (getEntryCollection as jest.Mock).mockReturnValue({
      aggregate: () => ({
        next: () => ({
          value: 1
        })
      })
    });

    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.MIN, valueName: 'abc' },
      { dataset: { datasetId: '1' } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: 1 } });
  });

  test('should get maximum', async () => {
    const ds: Dataset = {
      id: '1',
      name: 'name',
      workspaceId: '1',
      valueschemas: [
        {
          name: 'abc',
          type: DataType.NUMBER,
          required: true,
          unique: false,
          fallback: '0'
        }
      ]
    };
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);
    (getEntryCollection as jest.Mock).mockReturnValue({
      aggregate: () => ({
        next: () => ({
          value: 1
        })
      })
    });

    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.MAX, valueName: 'abc' },
      { dataset: { datasetId: '1' } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: 1 } });
  });

  test('should get median', async () => {
    const ds: Dataset = {
      id: '1',
      name: 'name',
      workspaceId: '1',
      valueschemas: [
        {
          name: 'abc',
          type: DataType.NUMBER,
          required: true,
          unique: false,
          fallback: '0'
        }
      ]
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
        { type: AggregationEntriesType.MED, valueName: 'abc' },
        { dataset: { datasetId: '1' } },
        { node: null, reqContext: { db: null, userId: '' } }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Median not supported yet');
    }
  });

  test('should get sum', async () => {
    const ds: Dataset = {
      id: '1',
      name: 'name',
      workspaceId: '1',
      valueschemas: [
        {
          name: 'abc',
          type: DataType.NUMBER,
          required: true,
          unique: false,
          fallback: '0'
        }
      ]
    };
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);
    (getEntryCollection as jest.Mock).mockReturnValue({
      aggregate: () => ({
        next: () => ({
          value: 1
        })
      })
    });

    const res = await AggregateEntriesNode.onNodeExecution(
      { type: AggregationEntriesType.SUM, valueName: 'abc' },
      { dataset: { datasetId: '1' } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { value: 1 } });
  });

  test('should throw error for missing schema', async () => {
    const ds: Dataset = {
      id: '1',
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
        { dataset: { datasetId: '1' } },
        { node: null, reqContext: { db: null, userId: '' } }
      );
    } catch (err) {
      expect(err.message).toBe('Schema not found');
    }
  });

  test('should throw error for wrong datatype', async () => {
    const ds: Dataset = {
      id: '1',
      name: 'name',
      workspaceId: '1',
      valueschemas: [
        {
          name: 'abc',
          type: DataType.STRING,
          required: true,
          unique: false,
          fallback: '0'
        }
      ]
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
        { dataset: { datasetId: '1' } },
        { node: null, reqContext: { db: null, userId: '' } }
      );
    } catch (err) {
      expect(err.message).toBe('Datatype not supported');
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
