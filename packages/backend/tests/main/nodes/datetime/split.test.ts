import { DatetimeSplitNodeDef } from '@masterthesis/shared';
import moment from 'moment';

import { DatetimeSplitNode } from '../../../../src/main/nodes/datetime/split';
import { NODE } from '../../../test-utils';

describe(DatetimeSplitNode.type, () => {
  test('should have correct properties', () => {
    expect(DatetimeSplitNode.type).toBe(DatetimeSplitNodeDef.type);
    expect(DatetimeSplitNode.isFormValid).toBeUndefined();
    expect(DatetimeSplitNode.isInputValid).toBeUndefined();
  });

  test('should have valid meta', async () => {
    const res = await DatetimeSplitNode.onMetaExecution(
      {},
      { value: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      day: { content: {}, isPresent: true },
      month: { content: {}, isPresent: true },
      year: { content: {}, isPresent: true },
      hours: { content: {}, isPresent: true },
      seconds: { content: {}, isPresent: true },
      minutes: { content: {}, isPresent: true }
    });
  });

  test('should not have valid meta', async () => {
    const res = await DatetimeSplitNode.onMetaExecution(
      {},
      { value: { content: { schema: [] }, isPresent: false } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      day: { content: {}, isPresent: false },
      month: { content: {}, isPresent: false },
      year: { content: {}, isPresent: false },
      hours: { content: {}, isPresent: false },
      seconds: { content: {}, isPresent: false },
      minutes: { content: {}, isPresent: false }
    });
  });

  test('should split time', async () => {
    const res = await DatetimeSplitNode.onNodeExecution(
      {},
      {
        value: moment({
          year: 2018,
          month: 3,
          day: 17,
          hour: 8,
          minute: 37,
          second: 5
        })
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    const { outputs } = res;
    expect(outputs).toEqual({
      day: 17,
      month: 3,
      year: 2018,
      seconds: 5,
      minutes: 37,
      hours: 8
    });
  });
});
