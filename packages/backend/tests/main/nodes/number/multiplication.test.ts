import { MultiplicationNodeDef } from '@masterthesis/shared';

import { MultiplicationNode } from '../../../../src/main/nodes/number/multiplication';

describe('MultiplicationNode', () => {
  test('should have correct properties', () => {
    expect(MultiplicationNode.type).toBe(MultiplicationNodeDef.type);
    expect(MultiplicationNode.isFormValid).toBeUndefined();
    expect(MultiplicationNode.isInputValid).toBeDefined();
  });

  test('should validate input', async () => {
    let res = await MultiplicationNode.isInputValid({ a: 3, b: 2 });
    expect(res).toBe(true);

    res = await MultiplicationNode.isInputValid({ a: -3, b: 2 });
    expect(res).toBe(true);

    res = await MultiplicationNode.isInputValid({ a: null, b: 2 });
    expect(res).toBe(false);
  });

  test('should multiply two numbers', async () => {
    const res = await MultiplicationNode.onNodeExecution(
      {},
      {
        a: 3,
        b: 2
      },
      null
    );

    expect(res.outputs.product).toBe(6);
  });

  test('should multiply two numbers with negative value', async () => {
    const res = await MultiplicationNode.onNodeExecution(
      {},
      {
        a: -12,
        b: 12
      },
      null
    );

    expect(res.outputs.product).toBe(-144);
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await MultiplicationNode.onMetaExecution(
      {},
      { a: null, b: null },
      null
    );
    expect(res).toEqual({ product: { content: {}, isPresent: false } });

    res = await MultiplicationNode.onMetaExecution(
      {},
      { a: undefined, b: undefined },
      null
    );
    expect(res).toEqual({ product: { content: {}, isPresent: false } });

    res = await MultiplicationNode.onMetaExecution(
      {},
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ product: { content: {}, isPresent: false } });
  });

  test('should return valid object for onMetaExecution', async () => {
    const res = await MultiplicationNode.onMetaExecution(
      {},
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ product: { content: {}, isPresent: true } });
  });
});
