import {
  DatetimeCompareNodeDef,
  TimeComparisonType
} from '@masterthesis/shared';

import { DatetimeCompareNode } from '../../../../src/main/nodes/datetime/compare';
import { NODE } from '../../../test-utils';

describe(DatetimeCompareNode.type, () => {
  test('should have correct properties', () => {
    expect(DatetimeCompareNode.type).toBe(DatetimeCompareNodeDef.type);
    expect(DatetimeCompareNode.isFormValid).toBeUndefined();
    expect(DatetimeCompareNode.isInputValid).toBeUndefined();
  });

  test('should have valid meta', async () => {
    const res = await DatetimeCompareNode.onMetaExecution(
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
    let res = await DatetimeCompareNode.onMetaExecution(
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

    res = await DatetimeCompareNode.onMetaExecution(
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
    let res = await DatetimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.EARLIER_THAN },
      {
        a: new Date(Date.UTC(2018, 11, 17, 8, 37, 5)),
        b: new Date(Date.UTC(2019, 11, 17, 8, 37, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: true
    });

    res = await DatetimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.EARLIER_THAN },
      {
        a: new Date(Date.UTC(2019, 11, 17, 8, 37, 5)),
        b: new Date(Date.UTC(2018, 11, 17, 8, 37, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: false
    });

    res = await DatetimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.LATER_THAN },
      {
        a: new Date(Date.UTC(2018, 11, 17, 8, 37, 5)),
        b: new Date(Date.UTC(2019, 11, 17, 8, 37, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: false
    });

    res = await DatetimeCompareNode.onNodeExecution(
      { type: TimeComparisonType.LATER_THAN },
      {
        a: new Date(Date.UTC(2019, 11, 17, 8, 37, 5)),
        b: new Date(Date.UTC(2018, 11, 17, 8, 37, 5))
      },
      { node: NODE, reqContext: { userId: '', db: null } }
    );
    expect(res.outputs).toEqual({
      value: true
    });

    const date = new Date(Date.UTC(2019, 11, 17, 8, 37, 5));
    res = await DatetimeCompareNode.onNodeExecution(
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
