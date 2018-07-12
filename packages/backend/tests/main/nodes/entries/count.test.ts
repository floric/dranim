import { CountEntriesNodeDef, Dataset } from '@masterthesis/shared';

import { CountEntriesNode } from '../../../../src/main/nodes/entries/count';
import { tryGetDataset } from '../../../../src/main/workspace/dataset';
import { getEntriesCount } from '../../../../src/main/workspace/entry';

jest.mock('../../../../src/main/workspace/dataset');
jest.mock('../../../../src/main/workspace/entry');

describe('CountEntriesNode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should have correct properties', () => {
    expect(CountEntriesNode.type).toBe(CountEntriesNodeDef.type);
    expect(CountEntriesNode.isFormValid).toBeUndefined();
    expect(CountEntriesNode.isInputValid).toBeUndefined();
  });

  test('should count entries', async () => {
    const ds: Dataset = {
      id: '1',
      name: 'name',
      workspaceId: '1',
      valueschemas: []
    };
    (tryGetDataset as jest.Mock).mockResolvedValue(ds);
    (getEntriesCount as jest.Mock).mockResolvedValue(123);

    const res = await CountEntriesNode.onNodeExecution(
      {},
      { dataset: { datasetId: '1' } },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { count: 123 } });
  });

  test('should have invalid meta', async () => {
    let res = await CountEntriesNode.onMetaExecution(
      {},
      { dataset: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({ count: { content: {}, isPresent: false } });

    res = await CountEntriesNode.onMetaExecution(
      {},
      { dataset: null },
      { db: null, userId: '' }
    );
    expect(res).toEqual({ count: { content: {}, isPresent: false } });
  });

  test('should have valid meta', async () => {
    const res = await CountEntriesNode.onMetaExecution(
      {},
      { dataset: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({ count: { content: {}, isPresent: true } });
  });
});
