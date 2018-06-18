import { XorNodeDef } from '@masterthesis/shared';

import { XorNode } from '../../../../../src/main/nodes/boolean/operators/xor';

describe('XorNode', () => {
  test('should have correct properties', () => {
    expect(XorNode.type).toBe(XorNodeDef.type);
    expect(XorNode.isFormValid).toBeUndefined();
    expect(XorNode.isInputValid).toBeUndefined();
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await XorNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await XorNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await XorNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await XorNode.onMetaExecution(
      {},
      {
        valueA: null,
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await XorNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: undefined
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await XorNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });

  test('should do xor comparison', async () => {
    let res = await XorNode.onNodeExecution(
      {},
      { valueA: true, valueB: true },
      null
    );
    expect(res.outputs.value).toEqual(false);

    res = await XorNode.onNodeExecution(
      {},
      { valueA: false, valueB: true },
      null
    );
    expect(res.outputs.value).toEqual(true);

    res = await XorNode.onNodeExecution(
      {},
      { valueA: true, valueB: false },
      null
    );
    expect(res.outputs.value).toEqual(true);

    res = await XorNode.onNodeExecution(
      {},
      { valueA: false, valueB: false },
      null
    );
    expect(res.outputs.value).toEqual(false);
  });
});
