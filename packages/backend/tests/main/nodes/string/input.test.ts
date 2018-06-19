import { StringInputNodeDef } from '@masterthesis/shared';

import { StringInputNode } from '../../../../src/main/nodes/string/input';

describe('StringInputNode', () => {
  test('should have correct properties', () => {
    expect(StringInputNode.type).toBe(StringInputNodeDef.type);
    expect(StringInputNode.isFormValid).toBeDefined();
    expect(StringInputNode.isInputValid).toBeUndefined();
  });

  test('should have invalid form', async () => {
    const res = await StringInputNode.isFormValid({ value: null });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    let res = await StringInputNode.isFormValid({ value: '' });
    expect(res).toBe(true);

    res = await StringInputNode.isFormValid({ value: 'test' });
    expect(res).toBe(true);
  });

  test('should get output value from form', async () => {
    const inputValue = 'a huge text';
    const form = { value: inputValue };

    const res = await StringInputNode.onNodeExecution(form, {}, null);
    expect(res.outputs.value).toBe(inputValue);
  });

  test('should return nothing onMetaExecution', async () => {
    let res = await StringInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await StringInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should return valid output onMetaExecution', async () => {
    let res = await StringInputNode.onMetaExecution({ value: '' }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await StringInputNode.onMetaExecution({ value: 'test' }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
