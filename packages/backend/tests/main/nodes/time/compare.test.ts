import { TimeCompareNodeDef, TimeComparisonType } from '@masterthesis/shared';

import { TimeCompareNode } from '../../../../src/main/nodes/time/compare';
import { NODE } from '../../../test-utils';

describe(TimeCompareNode.type, () => {
  test('should have correct properties', () => {
    expect(TimeCompareNode.type).toBe(TimeCompareNodeDef.type);
    expect(TimeCompareNode.isFormValid).toBeUndefined();
    expect(TimeCompareNode.isInputValid).toBeUndefined();
  });

  test('should have valid meta', async () => {
    const res = await TimeCompareNode.onMetaExecution(
      { type: TimeComparisonType.EARLIER_THAN },
      {
        a: { content: { schema: [] }, isPresent: true },
        b: { content: { schema: [] }, isPresent: true }
      },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      value: { content: {}, isPresent: true }
    });
  });

  test('should not have valid meta', async () => {
    let res = await TimeCompareNode.onMetaExecution(
      { type: TimeComparisonType.EARLIER_THAN },
      {
        a: { content: { schema: [] }, isPresent: false },
        b: { content: { schema: [] }, isPresent: true }
      },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      value: { content: {}, isPresent: false }
    });

    res = await TimeCompareNode.onMetaExecution(
      { type: TimeComparisonType.EARLIER_THAN },
      {
        a: { content: { schema: [] }, isPresent: true },
        b: { content: { schema: [] }, isPresent: false }
      },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      value: { content: {}, isPresent: false }
    });
  });

  test('should compare time', async () => {
    let res = await TimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.EARLIER_THAN },
      {
        a: new Date(Date.UTC(2018, 11, 17, 8, 34, 5)),
        b: new Date(Date.UTC(2019, 11, 17, 8, 37, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: true
    });

    res = await TimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.EARLIER_THAN },
      {
        a: new Date(Date.UTC(2019, 11, 17, 8, 37, 5)),
        b: new Date(Date.UTC(2018, 11, 17, 8, 32, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: false
    });

    res = await TimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.LATER_THAN },
      {
        a: new Date(Date.UTC(2018, 11, 17, 11, 37, 5)),
        b: new Date(Date.UTC(2019, 11, 17, 8, 37, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: false
    });

    res = await TimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.LATER_THAN },
      {
        a: new Date(Date.UTC(2019, 11, 17, 9, 37, 5)),
        b: new Date(Date.UTC(2018, 11, 17, 8, 37, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: true
    });

    const date = new Date(Date.UTC(2019, 11, 17, 8, 37, 5));
    res = await TimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.EQUALS },
      {
        a: date,
        b: date
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: true
    });
  });
});
