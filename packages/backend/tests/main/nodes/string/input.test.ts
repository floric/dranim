import { StringInputNodeDef } from '@masterthesis/shared';

import { StringInputNode } from '../../../../src/main/nodes/string/input';

describe('StringInputNode', () => {
  test('should have correct properties', () => {
    expect(StringInputNode.type).toBe(StringInputNodeDef.type);
    expect(StringInputNode.isFormValid).toBeUndefined();
    expect(StringInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form', async () => {
    const inputValue = 'a huge text';

    let res = await StringInputNode.onNodeExecution(
      { value: inputValue },
      {},
      null
    );
    expect(res.outputs.value).toBe(inputValue);

    res = await StringInputNode.onNodeExecution({ value: null }, {}, null);
    expect(res.outputs.value).toBe('');
  });

  test('should return valid output onMetaExecution', async () => {
    let res = await StringInputNode.onMetaExecution({ value: '' }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await StringInputNode.onMetaExecution({ value: 'test' }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await StringInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
