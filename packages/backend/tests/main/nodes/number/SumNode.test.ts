import { SumNodeDef } from '@masterthesis/shared';
import { SumNode } from '../../../../src/main/nodes/number/SumNode';

describe('SumNode', () => {
  test('should have correct properties', () => {
    expect(SumNode.name).toBe(SumNodeDef.name);
    expect(SumNode.isFormValid).toBeUndefined();
    expect(SumNode.isInputValid).toBeDefined();
  });

  // TODO add always tests for number checks or refactor to trust socket types

  test('should sum two numbers', async () => {
    const res = await SumNode.onServerExecution(
      {},
      {
        a: '1',
        b: '2'
      }
    );

    expect(res.outputs.sum).toBe('3');
  });
});
