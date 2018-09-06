import {
  ApolloContext,
  ComparisonNodeDef,
  ComparisonType
} from '@masterthesis/shared';

import { ComparisonNode } from '../../../../src/main/nodes/number/comparison';

describe('ComparisonNode', () => {
  test('should have correct properties', () => {
    expect(ComparisonNode.type).toBe(ComparisonNodeDef.type);
    expect(ComparisonNode.isFormValid).toBeUndefined();
    expect(ComparisonNode.isInputValid).toBeUndefined();
  });

  test('should not have valid meta', async () => {
    const reqContext: ApolloContext = { db: null, userId: '' };
    let res = await ComparisonNode.onMetaExecution(
      { type: ComparisonType.EQUALS },
      {
        a: { content: {}, isPresent: false },
        b: { content: {}, isPresent: true }
      },
      reqContext
    );

    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await ComparisonNode.onMetaExecution(
      { type: ComparisonType.EQUALS },
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: false }
      },
      reqContext
    );

    expect(res).toEqual({ value: { content: {}, isPresent: false } });

    res = await ComparisonNode.onMetaExecution(
      { type: ComparisonType.EQUALS },
      {
        a: { content: {}, isPresent: false },
        b: { content: {}, isPresent: true }
      },
      reqContext
    );

    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });

  test('should have valid meta', async () => {
    const reqContext: ApolloContext = { db: null, userId: '' };
    let res = await ComparisonNode.onMetaExecution(
      { type: null },
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: true }
      },
      reqContext
    );

    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await ComparisonNode.onMetaExecution(
      { type: undefined },
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: true }
      },
      reqContext
    );

    expect(res).toEqual({ value: { content: {}, isPresent: true } });

    res = await ComparisonNode.onMetaExecution(
      { type: ComparisonType.EQUALS },
      {
        a: { content: {}, isPresent: true },
        b: { content: {}, isPresent: true }
      },
      reqContext
    );
  });

  test('should do equals comparison', async () => {
    let res = await ComparisonNode.onNodeExecution(
      { type: null },
      { a: 9, b: 9 },
      null
    );

    expect(res).toEqual({ outputs: { value: true } });

    res = await ComparisonNode.onNodeExecution(
      { type: ComparisonType.EQUALS },
      { a: 9, b: 9 },
      null
    );

    expect(res).toEqual({ outputs: { value: true } });

    res = await ComparisonNode.onNodeExecution(
      { type: ComparisonType.EQUALS },
      { a: 19, b: 9 },
      null
    );

    expect(res).toEqual({ outputs: { value: false } });
  });

  test('should do gt comparison', async () => {
    let res = await ComparisonNode.onNodeExecution(
      { type: ComparisonType.GREATER_THAN },
      { a: 12, b: 9 },
      null
    );

    expect(res).toEqual({ outputs: { value: true } });

    res = await ComparisonNode.onNodeExecution(
      { type: ComparisonType.GREATER_THAN },
      { a: 9, b: 12 },
      null
    );

    expect(res).toEqual({ outputs: { value: false } });
  });

  test('should do lt comparison', async () => {
    let res = await ComparisonNode.onNodeExecution(
      { type: ComparisonType.LESS_THAN },
      { a: 1, b: 9 },
      null
    );

    expect(res).toEqual({ outputs: { value: true } });

    res = await ComparisonNode.onNodeExecution(
      { type: ComparisonType.LESS_THAN },
      { a: 12, b: 9 },
      null
    );

    expect(res).toEqual({ outputs: { value: false } });
  });
});
