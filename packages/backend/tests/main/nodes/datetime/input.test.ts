import { DatetimeInputNodeDef } from '@masterthesis/shared';

import { DatetimeInputNode } from '../../../../src/main/nodes/datetime/input';

describe(DatetimeInputNode.type, () => {
  test('should have correct properties', () => {
    expect(DatetimeInputNode.type).toBe(DatetimeInputNodeDef.type);
    expect(DatetimeInputNode.isFormValid).toBeDefined();
    expect(DatetimeInputNode.isInputValid).toBeUndefined();
  });

  test('should have invalid form', async () => {
    let res = await DatetimeInputNode.isFormValid({ value: null });
    expect(res).toBe(false);

    res = await DatetimeInputNode.isFormValid({ value: undefined });
    expect(res).toBe(false);

    res = await DatetimeInputNode.isFormValid({ value: 'test' });
    expect(res).toBe(false);

    res = await DatetimeInputNode.isFormValid({ value: '' });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    const date = new Date().toISOString();
    const res = await DatetimeInputNode.isFormValid({ value: date });
    expect(res).toBe(true);
  });

  test('should get output value from form', async () => {
    const date = new Date();
    const res = await DatetimeInputNode.onNodeExecution(
      { value: date.toISOString() },
      {},
      null
    );
    expect(res.outputs.value.toISOString()).toBe(date.toISOString());
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await DatetimeInputNode.onMetaExecution(
      { value: null },
      {},
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await DatetimeInputNode.onMetaExecution(
      { value: undefined },
      {},
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await DatetimeInputNode.onMetaExecution(
      { value: new Date().toISOString() },
      {},
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
