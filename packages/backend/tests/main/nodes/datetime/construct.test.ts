import { DatetimeConstructNodeDef } from '@masterthesis/shared';

import { DatetimeConstructNode } from '../../../../src/main/nodes/datetime/construct';

describe(DatetimeConstructNode.type, () => {
  test('should have correct properties', () => {
    expect(DatetimeConstructNode.type).toBe(DatetimeConstructNode.type);
    expect(DatetimeConstructNode.isFormValid).toBeUndefined();
    expect(DatetimeConstructNode.isInputValid).toBeDefined();
  });

  test('should have invalid inputs', async () => {
    let res = await DatetimeConstructNode.isInputValid({
      day: 1.5,
      month: 1,
      year: 1,
      time: new Date()
    });
    expect(res).toBe(false);

    res = await DatetimeConstructNode.isInputValid({
      day: 1,
      month: 1.5,
      year: 1,
      time: new Date()
    });
    expect(res).toBe(false);

    res = await DatetimeConstructNode.isInputValid({
      day: 1,
      month: 1,
      year: 1.5,
      time: new Date()
    });
    expect(res).toBe(false);
  });

  test('should have valid inputs', async () => {
    let res = await DatetimeConstructNode.isInputValid({
      day: 1,
      month: 1,
      year: 0,
      time: new Date()
    });
    expect(res).toBe(true);

    res = await DatetimeConstructNode.isInputValid({
      day: 31,
      month: 12,
      year: 2018,
      time: new Date()
    });
    expect(res).toBe(true);
  });

  test('should get output value from input', async () => {
    const date = new Date(Date.UTC(2018, 1, 1, 12, 34, 56));
    const res = await DatetimeConstructNode.onNodeExecution(
      {},
      { day: 1, month: 1, year: 2018, time: date },
      null
    );

    expect(res.outputs.value).toEqual(date);
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await DatetimeConstructNode.onMetaExecution(
      {},
      {
        day: { content: {}, isPresent: false },
        month: { content: {}, isPresent: false },
        year: { content: {}, isPresent: false },
        time: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await DatetimeConstructNode.onMetaExecution(
      {},
      {
        day: { content: {}, isPresent: true },
        month: { content: {}, isPresent: false },
        year: { content: {}, isPresent: false },
        time: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await DatetimeConstructNode.onMetaExecution(
      {},
      {
        day: { content: {}, isPresent: true },
        month: { content: {}, isPresent: true },
        year: { content: {}, isPresent: false },
        time: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await DatetimeConstructNode.onMetaExecution(
      {},
      {
        day: { content: {}, isPresent: true },
        month: { content: {}, isPresent: true },
        year: { content: {}, isPresent: true },
        time: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await DatetimeConstructNode.onMetaExecution(
      { value: new Date() },
      {
        day: { content: {}, isPresent: true },
        month: { content: {}, isPresent: true },
        year: { content: {}, isPresent: true },
        time: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
