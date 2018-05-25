import { FormatNumberNodeDef } from '@masterthesis/shared';
import { FormatNumberNode } from '../../../../src/main/nodes/number/FormatNumberNode';

describe('FormatNumberNode', () => {
  test('should have correct properties', () => {
    expect(FormatNumberNode.name).toBe(FormatNumberNodeDef.name);
    expect(FormatNumberNode.isFormValid).toBeUndefined();
    expect(FormatNumberNode.isInputValid).toBeDefined();
  });

  test('should print number default', async () => {
    const res = await FormatNumberNode.onServerExecution(
      {},
      {
        number: 123
      },
      null
    );

    expect(res.outputs.formatted).toBe('123');
  });

  test('should print number as average', async () => {
    const res = await FormatNumberNode.onServerExecution(
      {
        average: false
      },
      {
        number: 123456
      },
      null
    );

    expect(res.outputs.formatted).toBe('123 k');
  });

  test('should print number with mantissa', async () => {
    const res = await FormatNumberNode.onServerExecution(
      {
        output: 'time'
      },
      {
        number: 60 * 60 * 12
      },
      null
    );

    expect(res.outputs.formatted).toBe('12:00:00');
  });
});
