import { NumberOutputNodeDef } from '@masterthesis/shared';

import { NumberOutputNode } from '../../../../src/main/nodes/number/output';

describe('NumberOutputNode', () => {
  test('should have correct properties', () => {
    expect(NumberOutputNode.type).toBe(NumberOutputNodeDef.type);
    expect(NumberOutputNode.isFormValid).toBeUndefined();
    expect(NumberOutputNode.isInputValid).toBeUndefined();
    expect(NumberOutputNodeDef.isOutputNode).toBe(true);
  });

  test('should get output int value from input', async () => {
    const res = await NumberOutputNode.onNodeExecution(
      {},
      {
        value: 2
      },
      null
    );

    expect(res.results.value).toBe(2);
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should get output negative float value from input', async () => {
    const res = await NumberOutputNode.onNodeExecution(
      {},
      {
        value: -2.34
      },
      null
    );

    expect(res.results.value).toBe(-2.34);
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should always return empty object for onMetaExecution', async () => {
    let res = await NumberOutputNode.onMetaExecution({}, { value: null }, null);
    expect(res).toEqual({});

    res = await NumberOutputNode.onMetaExecution(
      {},
      { value: { content: {}, isPresent: false } },
      null
    );
    expect(res).toEqual({});

    res = await NumberOutputNode.onMetaExecution(
      {},
      { value: { content: {}, isPresent: true } },
      null
    );
    expect(res).toEqual({});
  });
});
