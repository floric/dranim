import { SumNodeDef } from '@masterthesis/shared';

import { SumNode } from '../../../../src/main/nodes/number/sum';

describe('SumNode', () => {
  test('should have correct properties', () => {
    expect(SumNodeDef.type).toBe(SumNodeDef.type);
    expect(SumNode.isFormValid).toBeUndefined();
    expect(SumNode.isInputValid).toBeDefined();
  });

  test('should validate input', async () => {
    let res = await SumNode.isInputValid({ a: 3, b: 2 });
    expect(res).toBe(true);

    res = await SumNode.isInputValid({ a: -3, b: 2 });
    expect(res).toBe(true);

    res = await SumNode.isInputValid({ a: null, b: 2 });
    expect(res).toBe(false);
  });

  test('should sum two numbers', async () => {
    const res = await SumNode.onNodeExecution(
      {},
      {
        a: 17,
        b: 15
      },
      null
    );

    expect(res.outputs.sum).toBe(32);
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await SumNode.onMetaExecution({}, { a: null, b: null }, null);
    expect(res).toEqual({ sum: { content: {}, isPresent: false } });

    res = await SumNode.onMetaExecution(
      {},
      { a: undefined, b: undefined },
      null
    );
    expect(res).toEqual({ sum: { content: {}, isPresent: false } });

    res = await SumNode.onMetaExecution(
      {},
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ sum: { content: {}, isPresent: false } });
  });

  test('should return valid object for onMetaExecution', async () => {
    const res = await SumNode.onMetaExecution(
      {},
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ sum: { content: {}, isPresent: true } });
  });
});
