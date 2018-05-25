import { SumNodeDef } from '@masterthesis/shared';
import { SumNode } from '../../../../src/main/nodes/number/SumNode';

describe('SumNode', () => {
  test('should have correct properties', () => {
    expect(SumNode.name).toBe(SumNodeDef.name);
    expect(SumNode.isFormValid).toBeUndefined();
    expect(SumNode.isInputValid).toBeDefined();
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
