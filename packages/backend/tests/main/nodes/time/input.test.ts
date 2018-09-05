import { TimeInputNodeDef } from '@masterthesis/shared';

import { TimeInputNode } from '../../../../src/main/nodes/time/input';

describe(TimeInputNode.type, () => {
  test('should have correct properties', () => {
    expect(TimeInputNode.type).toBe(TimeInputNodeDef.type);
    expect(TimeInputNode.isFormValid).toBeDefined();
    expect(TimeInputNode.isInputValid).toBeUndefined();
  });

  test('should have invalid form', async () => {
    let res = await TimeInputNode.isFormValid({ value: null });
    expect(res).toBe(false);

    res = await TimeInputNode.isFormValid({ value: undefined });
    expect(res).toBe(false);

    res = await TimeInputNode.isFormValid({ value: 'test' });
    expect(res).toBe(false);

    res = await TimeInputNode.isFormValid({ value: '' });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    const res = await TimeInputNode.isFormValid({
      value: new Date().toISOString()
    });
    expect(res).toBe(true);
  });

  test('should get output value from form', async () => {
    const date = new Date(Date.UTC(2018, 11, 3, 16, 23, 2));
    const res = await TimeInputNode.onNodeExecution(
      { value: date.toISOString() },
      {},
      null
    );
    expect(res.outputs.value.getTime()).toBe(date.getTime());
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await TimeInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await TimeInputNode.onMetaExecution({ value: undefined }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await TimeInputNode.onMetaExecution(
      { value: new Date().toISOString() },
      {},
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
