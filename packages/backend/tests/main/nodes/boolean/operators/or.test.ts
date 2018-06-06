import { OrNodeDef } from '@masterthesis/shared';

import { OrNode } from '../../../../../src/main/nodes/boolean/operators/or';

describe('OrNode', () => {
  test('should have correct properties', () => {
    expect(OrNode.name).toBe(OrNodeDef.name);
    expect(OrNode.isFormValid).toBeUndefined();
    expect(OrNode.isInputValid).toBeDefined();
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

  test('should have valid inputs', async () => {
    let res = await OrNode.isInputValid({
      valueA: true,
      valueB: true
    });
    expect(res).toBe(true);

    res = await OrNode.isInputValid({
      valueA: true,
      valueB: false
    });
    expect(res).toBe(true);
  });

  test('should have invalid inputs', async () => {
    let res = await OrNode.isInputValid({
      valueA: null,
      valueB: true
    });
    expect(res).toBe(false);

    res = await OrNode.isInputValid({
      valueA: true,
      valueB: undefined
    });
    expect(res).toBe(false);
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
