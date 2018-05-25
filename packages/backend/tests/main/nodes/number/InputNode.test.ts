import { NumberInputNodeDef } from '@masterthesis/shared';
import { NumberInputNode } from '../../../../src/main/nodes/number/InputNode';

describe('NumberInputNode', () => {
  test('should have correct properties', () => {
    expect(NumberInputNode.name).toBe(NumberInputNodeDef.name);
    expect(NumberInputNode.isFormValid).toBeDefined();
    expect(NumberInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form', async () => {
    const res = await NumberInputNode.onServerExecution({ value: 2 }, {}, null);
    expect(res.outputs.val).toBe(2);
  });
});
