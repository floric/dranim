import { NumberInputNodeDef } from '@masterthesis/shared';

import { NumberInputNode } from '../../../../src/main/nodes/number/input';

describe('NumberInputNode', () => {
  test('should have correct properties', () => {
    expect(NumberInputNode.name).toBe(NumberInputNodeDef.name);
    expect(NumberInputNode.isFormValid).toBeDefined();
    expect(NumberInputNode.isInputValid).toBeUndefined();
  });

  test('should validate input', async () => {
    let res = await NumberInputNode.isFormValid({ value: 3 });
    expect(res).toBe(true);

    res = await NumberInputNode.isFormValid({ value: -123.3 });
    expect(res).toBe(true);

    res = await NumberInputNode.isFormValid({ value: null });
    expect(res).toBe(false);

    res = await NumberInputNode.isFormValid({ value: 'test' as any });
    expect(res).toBe(false);
  });

  test('should get output value from form', async () => {
    const res = await NumberInputNode.onNodeExecution({ value: 2 }, {}, null);
    expect(res.outputs.value).toBe(2);
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await NumberInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await NumberInputNode.onMetaExecution({ value: undefined }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    let res = await NumberInputNode.onMetaExecution({ value: 0 }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await NumberInputNode.onMetaExecution({ value: -1.2 }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
