import { CountEntriesNodeDef, DataType } from '@masterthesis/shared';

import { CountEntriesNode } from '../../../../src/main/nodes/entries/count';

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
    const res = await CountEntriesNode.onNodeExecution(
      {},
      {
        dataset: {
          entries: [{ test: 1 }, { test: 2 }],
          schema: [
            {
              name: 'test',
              unique: false,
              required: true,
              fallback: '0',
              type: DataType.NUMBER
            }
          ]
        }
      },
      { node: null, reqContext: { db: null, userId: '' } }
    );
    expect(res).toEqual({ outputs: { count: 2 } });
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
