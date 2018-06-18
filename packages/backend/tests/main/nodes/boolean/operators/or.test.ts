import { OrNodeDef } from '@masterthesis/shared';

import { OrNode } from '../../../../../src/main/nodes/boolean/operators/or';

describe('OrNode', () => {
  test('should have correct properties', () => {
    expect(OrNode.type).toBe(OrNodeDef.type);
    expect(OrNode.isFormValid).toBeUndefined();
    expect(OrNode.isInputValid).toBeUndefined();
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await OrNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await OrNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await OrNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await OrNode.onMetaExecution(
      {},
      {
        valueA: null,
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await OrNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: undefined
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await OrNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });

  test('should do or comparison', async () => {
    let res = await OrNode.onNodeExecution(
      {},
      { valueA: true, valueB: true },
      null
    );
    expect(res.outputs.value).toEqual(true);

    res = await OrNode.onNodeExecution(
      {},
      { valueA: false, valueB: true },
      null
    );
    expect(res.outputs.value).toEqual(true);

    res = await OrNode.onNodeExecution(
      {},
      { valueA: true, valueB: false },
      null
    );
    expect(res.outputs.value).toEqual(true);

    res = await OrNode.onNodeExecution(
      {},
      { valueA: false, valueB: false },
      null
    );
    expect(res.outputs.value).toEqual(false);
  });
});
