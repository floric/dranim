import { NumberInputNodeDef } from '@masterthesis/shared';

import { NumberInputNode } from '../../../../src/main/nodes/number/input';

describe('NumberInputNode', () => {
  test('should have correct properties', () => {
    expect(NumberInputNode.type).toBe(NumberInputNodeDef.type);
    expect(NumberInputNode.isFormValid).toBeUndefined();
    expect(NumberInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form', async () => {
    let res = await NumberInputNode.onNodeExecution({ value: 2 }, {}, null);
    expect(res.outputs.value).toBe(2);

    res = await NumberInputNode.onNodeExecution({ value: null }, {}, null);
    expect(res.outputs.value).toBe(0);
  });

  test('should valid empty object for onMetaExecution', async () => {
    let res = await NumberInputNode.onMetaExecution({ value: 0 }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await NumberInputNode.onMetaExecution({ value: -1.2 }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await NumberInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
