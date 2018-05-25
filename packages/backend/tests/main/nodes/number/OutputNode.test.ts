import { NumberOutputNodeDef } from '@masterthesis/shared';
import { NumberOutputNode } from '../../../../src/main/nodes/number/OutputNode';

describe('NumberOutputNode', () => {
  test('should have correct properties', () => {
    expect(NumberOutputNode.name).toBe(NumberOutputNodeDef.name);
    expect(NumberOutputNode.isFormValid).toBeUndefined();
    expect(NumberOutputNode.isInputValid).toBeDefined();
  });

  test('should check valid int number', async () => {
    const res = await NumberOutputNode.isInputValid({ val: 1 });
    expect(res).toBe(true);
  });

  test('should check valid float number', async () => {
    const res = await NumberOutputNode.isInputValid({ val: -1.23 });
    expect(res).toBe(true);
  });

  test('should check invalid number', async () => {
    const res = await NumberOutputNode.isInputValid({ val: NaN });
    expect(res).toBe(false);
  });

  test('should get output int value from input', async () => {
    const res = await NumberOutputNode.onServerExecution(
      {},
      {
        val: 2
      },
      null
    );

    expect(res.results.value).toBe(2);
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should get output negative float value from input', async () => {
    const res = await NumberOutputNode.onServerExecution(
      {},
      {
        val: -2.34
      },
      null
    );

    expect(res.results.value).toBe(-2.34);
    expect(Object.keys(res.outputs).length).toBe(0);
  });
});
