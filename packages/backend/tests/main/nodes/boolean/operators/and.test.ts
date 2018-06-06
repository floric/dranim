import { AndNodeDef } from '@masterthesis/shared';

import { AndNode } from '../../../../../src/main/nodes/boolean/operators/and';

describe('AndNode', () => {
  test('should have correct properties', () => {
    expect(AndNode.name).toBe(AndNodeDef.name);
    expect(AndNode.isFormValid).toBeUndefined();
    expect(AndNode.isInputValid).toBeDefined();
  });

  test('should return empty object for onMetaExecution', async () => {
    let res = await AndNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await AndNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: false }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await AndNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: false },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await AndNode.onMetaExecution(
      {},
      {
        valueA: null,
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await AndNode.onMetaExecution(
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
    let res = await AndNode.isInputValid({
      valueA: true,
      valueB: true
    });
    expect(res).toBe(true);

    res = await AndNode.isInputValid({
      valueA: true,
      valueB: false
    });
    expect(res).toBe(true);
  });

  test('should have invalid inputs', async () => {
    let res = await AndNode.isInputValid({
      valueA: null,
      valueB: true
    });
    expect(res).toBe(false);

    res = await AndNode.isInputValid({
      valueA: true,
      valueB: undefined
    });
    expect(res).toBe(false);
  });

  test('should valid empty object for onMetaExecution', async () => {
    const res = await AndNode.onMetaExecution(
      {},
      {
        valueA: { content: {}, isPresent: true },
        valueB: { content: {}, isPresent: true }
      },
      null
    );
    expect(res).toEqual({ value: { content: {}, isPresent: true } });
  });

  test('should do and comparison', async () => {
    let res = await AndNode.onNodeExecution(
      {},
      { valueA: true, valueB: true },
      null
    );
    expect(res.outputs.value).toEqual(true);

    res = await AndNode.onNodeExecution(
      {},
      { valueA: false, valueB: true },
      null
    );
    expect(res.outputs.value).toEqual(false);

    res = await AndNode.onNodeExecution(
      {},
      { valueA: true, valueB: false },
      null
    );
    expect(res.outputs.value).toEqual(false);

    res = await AndNode.onNodeExecution(
      {},
      { valueA: false, valueB: false },
      null
    );
    expect(res.outputs.value).toEqual(false);
  });
});
