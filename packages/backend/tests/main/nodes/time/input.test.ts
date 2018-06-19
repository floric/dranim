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
  });

  test('should have valid form', async () => {
    const res = await TimeInputNode.isFormValid({ value: new Date() });
    expect(res).toBe(true);
  });

  test('should get output value from form', async () => {
    const date = new Date();
    const res = await TimeInputNode.onNodeExecution({ value: date }, {}, null);
    expect(res.outputs.value).toBe(date);
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await TimeInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await TimeInputNode.onMetaExecution({ value: undefined }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await TimeInputNode.onMetaExecution(
      { value: new Date() },
      {},
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
