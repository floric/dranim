import { BooleanInputNodeDef } from '@masterthesis/shared';

import { BooleanInputNode } from '../../../../src/main/nodes/boolean/input';

describe('BooleanInputNode', () => {
  test('should have correct properties', () => {
    expect(BooleanInputNode.type).toBe(BooleanInputNodeDef.type);
    expect(BooleanInputNode.isFormValid).toBeUndefined();
    expect(BooleanInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form', async () => {
    let res = await BooleanInputNode.onNodeExecution({ value: true }, {}, null);
    expect(res.outputs.value).toBe(true);

    res = await BooleanInputNode.onNodeExecution({ value: false }, {}, null);
    expect(res.outputs.value).toBe(false);
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await BooleanInputNode.onMetaExecution({ value: null }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await BooleanInputNode.onMetaExecution(
      { value: undefined },
      {},
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    let res = await BooleanInputNode.onMetaExecution({ value: true }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await BooleanInputNode.onMetaExecution({ value: false }, {}, null);
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });
});
