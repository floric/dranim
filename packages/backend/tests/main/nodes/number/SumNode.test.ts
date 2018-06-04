import { SumNodeDef } from '@masterthesis/shared';

import { SumNode } from '../../../../src/main/nodes/number/SumNode';

describe('SumNode', () => {
  /*test('should have correct properties', () => {
    expect(SumNode.name).toBe(SumNodeDef.name);
    expect(SumNode.isFormValid).toBeUndefined();
    expect(SumNode.isInputValid).toBeDefined();
  });*/

  test('should validate input', async () => {
    let res = await SumNode.isInputValid({ a: 3, b: 2 });
    expect(res).toBe(true);

    res = await SumNode.isInputValid({ a: -3, b: 2 });
    expect(res).toBe(true);

    res = await SumNode.isInputValid({ a: null, b: 2 });
    expect(res).toBe(false);
  });

  test('should sum two numbers', async () => {
    const res = await SumNode.onServerExecution(
      {},
      {
        a: 17,
        b: 15
      },
      null
    );

    expect(res.outputs.sum).toBe(32);
  });
});
