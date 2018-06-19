import { EqualsStringNodeDef } from '@masterthesis/shared';

import { EqualsStringNode } from '../../../../../src/main/nodes/boolean/comparisons/equals-string';

describe('EqualsStringNode', () => {
  test('should have correct properties', () => {
    expect(EqualsStringNode.type).toBe(EqualsStringNodeDef.type);
    expect(EqualsStringNode.isFormValid).toBeUndefined();
    expect(EqualsStringNode.isInputValid).toBeUndefined();
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await EqualsStringNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ equals: { content: {}, isPresent: false } });

    res = await EqualsStringNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ equals: { content: {}, isPresent: false } });

    res = await EqualsStringNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ equals: { content: {}, isPresent: false } });

    res = await EqualsStringNode.onMetaExecution(
      {},
      {
        valueA: null,
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ equals: { content: {}, isPresent: false } });

    res = await EqualsStringNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: undefined
      },
      null
    );
    expect(res).toEqual({ equals: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await EqualsStringNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ equals: { content: {}, isPresent: true } });
  });

  test('should compare values if they are equal', async () => {
    let res = await EqualsStringNode.onNodeExecution(
      {},
      { valueA: 'true', valueB: 'true' },
      null
    );
    expect(res.outputs.equals).toEqual(true);

    res = await EqualsStringNode.onNodeExecution(
      {},
      { valueA: 'false', valueB: 'true' },
      null
    );
    expect(res.outputs.equals).toEqual(false);

    res = await EqualsStringNode.onNodeExecution(
      {},
      { valueA: 'true', valueB: 'false' },
      null
    );
    expect(res.outputs.equals).toEqual(false);

    res = await EqualsStringNode.onNodeExecution(
      {},
      { valueA: 'false', valueB: 'false' },
      null
    );
    expect(res.outputs.equals).toEqual(true);
  });
});
