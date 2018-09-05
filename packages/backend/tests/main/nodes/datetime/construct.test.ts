import { DatetimeConstructNodeDef } from '@masterthesis/shared';

import { DatetimeConstructNode } from '../../../../src/main/nodes/datetime/construct';

describe(DatetimeConstructNode.type, () => {
  test('should have correct properties', () => {
    expect(DatetimeConstructNode.type).toBe(DatetimeConstructNodeDef.type);
    expect(DatetimeConstructNode.isFormValid).toBeUndefined();
    expect(DatetimeConstructNode.isInputValid).toBeDefined();
  });

  test('should have invalid inputs', async () => {
    let res = await DatetimeConstructNode.isInputValid({
      day: 1.5,
      month: 1,
      year: 1,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    expect(res).toBe(false);

    res = await DatetimeConstructNode.isInputValid({
      day: 1,
      month: 1.5,
      year: 1,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    expect(res).toBe(false);

    res = await DatetimeConstructNode.isInputValid({
      day: 1,
      month: 1,
      year: 1.5,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    expect(res).toBe(false);
  });

  test('should have valid inputs', async () => {
    let res = await DatetimeConstructNode.isInputValid({
      day: 1,
      month: 1,
      year: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    expect(res).toBe(true);

    res = await DatetimeConstructNode.isInputValid({
      day: 31,
      month: 12,
      year: 2018,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    expect(res).toBe(true);
  });

  test('should get output value from input', async () => {
    const date = {
      day: 1,
      month: 12,
      year: 2018,
      hours: 20,
      minutes: 30,
      seconds: 2
    };
    const res = await DatetimeConstructNode.onNodeExecution({}, date, null);

    expect(res.outputs.value.toISOString()).toEqual(
      new Date(Date.UTC(2018, 11, 1, 20, 30, 2)).toISOString()
    );
    expect(res.outputs.value.getUTCMonth() + 1).toBe(12);
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await DatetimeConstructNode.onMetaExecution(
      {},
      {
        day: { content: {}, isPresent: false },
        month: { content: {}, isPresent: false },
        year: { content: {}, isPresent: false },
        hours: { content: {}, isPresent: false },
        minutes: { content: {}, isPresent: false },
        seconds: { content: {}, isPresent: false }
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
        hours: { content: {}, isPresent: false },
        minutes: { content: {}, isPresent: false },
        seconds: { content: {}, isPresent: false }
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
        hours: { content: {}, isPresent: false },
        minutes: { content: {}, isPresent: false },
        seconds: { content: {}, isPresent: false }
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
        hours: { content: {}, isPresent: false },
        minutes: { content: {}, isPresent: false },
        seconds: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should have valid empty object for onMetaExecution', async () => {
    const res = await DatetimeConstructNode.onMetaExecution(
      {},
      {
        day: { content: {}, isPresent: true },
        month: { content: {}, isPresent: true },
        year: { content: {}, isPresent: true },
        hours: { content: {}, isPresent: true },
        minutes: { content: {}, isPresent: true },
        seconds: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
