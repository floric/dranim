import { FormatNumberNodeDef } from '@masterthesis/shared';

import { FormatNumberNode } from '../../../../src/main/nodes/number/FormatNumberNode';

describe('FormatNumberNode', () => {
  test('should have correct properties', () => {
    expect(FormatNumberNode.name).toBe(FormatNumberNodeDef.name);
    expect(FormatNumberNode.isFormValid).toBeUndefined();
    expect(FormatNumberNode.isInputValid).toBeDefined();
  });

  test('should print number default', async () => {
    const res = await FormatNumberNode.onNodeExecution(
      {},
      {
        number: 123
      },
      null
    );

    expect(res.outputs.formatted).toBe('123');
  });

  test('should print number as average', async () => {
    const res = await FormatNumberNode.onNodeExecution(
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
    const res = await FormatNumberNode.onNodeExecution(
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

  test('should return absent meta on onMetaExecution', async () => {
    let res = await FormatNumberNode.onMetaExecution(
      {},
      { number: null },
      null
    );
    expect(res).toEqual({ formatted: { content: {}, isPresent: false } });

    res = await FormatNumberNode.onMetaExecution(
      {},
      { number: undefined },
      null
    );
    expect(res).toEqual({ formatted: { content: {}, isPresent: false } });

    res = await FormatNumberNode.onMetaExecution(
      {},
      { number: { isPresent: false, content: {} } },
      null
    );
    expect(res).toEqual({ formatted: { content: {}, isPresent: false } });
  });

  test('should return valid object for onMetaExecution', async () => {
    const res = await FormatNumberNode.onMetaExecution(
      {},
      { number: { content: {}, isPresent: true } },
      null
    );
    expect(res).toEqual({ formatted: { content: {}, isPresent: true } });
  });
});
