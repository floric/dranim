import { StringInputNodeDef } from '@masterthesis/shared';

import { StringInputNode } from '../../../../src/main/nodes/string/InputNode';

describe('StringInputNode', () => {
  test('should have correct properties', () => {
    expect(StringInputNode.name).toBe(StringInputNodeDef.name);
    expect(StringInputNode.isFormValid).toBeUndefined();
    expect(StringInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form', async () => {
    const inputValue = 'a huge text';
    const form = { value: inputValue };

    const res = await StringInputNode.onNodeExecution(form, {}, null);
    expect(res.outputs.string).toBe(inputValue);
  });

  test('should return nothing onMetaExecution', async () => {
    let res = await StringInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ string: { content: {}, isPresent: false } });

    res = await StringInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ string: { content: {}, isPresent: false } });
  });

  test('should return valid output onMetaExecution', async () => {
    let res = await StringInputNode.onMetaExecution({ value: '' }, {}, null);
    expect(res).toEqual({ string: { content: {}, isPresent: true } });

    res = await StringInputNode.onMetaExecution({ value: 'test' }, {}, null);
    expect(res).toEqual({ string: { content: {}, isPresent: true } });
  });
});
