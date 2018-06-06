import { BooleanOutputNodeDef } from '@masterthesis/shared';

import { BooleanOutputNode } from '../../../../src/main/nodes/boolean/output';

describe('BooleanOutputNode', () => {
  test('should have correct properties', () => {
    expect(BooleanOutputNode.name).toBe(BooleanOutputNodeDef.name);
    expect(BooleanOutputNode.isFormValid).toBeUndefined();
    expect(BooleanOutputNode.isInputValid).toBeDefined();
    expect(BooleanOutputNodeDef.isOutputNode).toBe(true);
  });

  test('should check valid inputs', async () => {
    let res = await BooleanOutputNode.isInputValid({ value: true });
    expect(res).toBe(true);

    res = await BooleanOutputNode.isInputValid({ value: false });
    expect(res).toBe(true);
  });

  test('should check invalid inputs', async () => {
    let res = await BooleanOutputNode.isInputValid({ value: null });
    expect(res).toBe(false);

    res = await BooleanOutputNode.isInputValid({ value: undefined });
    expect(res).toBe(false);
  });

  test('should get output false value from input', async () => {
    const res = await BooleanOutputNode.onNodeExecution(
      {},
      {
        value: true
      },
      null
    );

    expect(res.results.value).toBe(true);
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should get output true value from input', async () => {
    const res = await BooleanOutputNode.onNodeExecution(
      {},
      {
        value: false
      },
      null
    );

    expect(res.results.value).toBe(false);
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should always return empty object for onMetaExecution', async () => {
    let res = await BooleanOutputNode.onMetaExecution(
      {},
      { value: null },
      null
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      {},
      { value: { content: {}, isPresent: false } },
      null
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      {},
      { value: { content: {}, isPresent: true } },
      null
    );
    expect(res).toEqual({});
  });
});
