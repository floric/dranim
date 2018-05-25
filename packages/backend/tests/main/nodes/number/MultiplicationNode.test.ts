import { MultiplicationNodeDef } from '@masterthesis/shared';
import { MultiplicationNode } from '../../../../src/main/nodes/number/MultiplicationNode';

describe('MultiplicationNode', () => {
  test('should have correct properties', () => {
    expect(MultiplicationNode.name).toBe(MultiplicationNodeDef.name);
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
    const res = await MultiplicationNode.onServerExecution(
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
    const res = await MultiplicationNode.onServerExecution(
      {},
      {
        a: -12,
        b: 12
      },
      null
    );

    expect(res.outputs.product).toBe(-144);
  });
});
