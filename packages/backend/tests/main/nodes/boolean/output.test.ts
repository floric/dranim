import { BooleanOutputNodeDef } from '@masterthesis/shared';

import { BooleanOutputNode } from '../../../../src/main/nodes/boolean/output';

describe('BooleanOutputNode', () => {
  test('should have correct properties', () => {
    expect(BooleanOutputNode.type).toBe(BooleanOutputNodeDef.type);
    expect(BooleanOutputNode.isFormValid).toBeDefined();
    expect(BooleanOutputNode.isInputValid).toBeUndefined();
    expect(BooleanOutputNodeDef.isOutputNode).toBe(true);
  });

  test('should get output false value from input', async () => {
    const res = await BooleanOutputNode.onNodeExecution(
      { name: 'test', description: '' },
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
      { name: 'test', description: '' },
      { value: null },
      null
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: { content: {}, isPresent: false } },
      null
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: { content: {}, isPresent: true } },
      null
    );
    expect(res).toEqual({});
  });
});
