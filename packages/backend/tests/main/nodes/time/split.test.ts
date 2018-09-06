import { TimeSplitNodeDef } from '@masterthesis/shared';

import { TimeSplitNode } from '../../../../src/main/nodes/time/split';
import { NODE } from '../../../test-utils';

describe(TimeSplitNode.type, () => {
  test('should have correct properties', () => {
    expect(TimeSplitNode.type).toBe(TimeSplitNodeDef.type);
    expect(TimeSplitNode.isFormValid).toBeUndefined();
    expect(TimeSplitNode.isInputValid).toBeUndefined();
  });

  test('should have valid meta', async () => {
    const res = await TimeSplitNode.onMetaExecution(
      {},
      { value: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      seconds: { content: {}, isPresent: true },
      hours: { content: {}, isPresent: true },
      minutes: { content: {}, isPresent: true }
    });
  });

  test('should not have valid meta', async () => {
    const res = await TimeSplitNode.onMetaExecution(
      {},
      { value: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      seconds: { content: {}, isPresent: false },
      hours: { content: {}, isPresent: false },
      minutes: { content: {}, isPresent: false }
    });
  });

  test('should split time', async () => {
    const res = await TimeSplitNode.onNodeExecution(
      {},
      { value: new Date(Date.UTC(0, 0, 0, 8, 37, 56)) },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res).toEqual({
      outputs: {
        hours: 8,
        minutes: 37,
        seconds: 56
      }
    });
  });
});
