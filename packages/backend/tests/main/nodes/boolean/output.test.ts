import { BooleanOutputNodeDef, DataType } from '@masterthesis/shared';

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
      { name: 'test', description: '', dashboardId: 'abc' },
      {
        value: true
      },
      null
    );

    expect(res.results.value).toBe(true);
    expect(res.results.type).toBe(DataType.BOOLEAN);
    expect(res.results.name).toBe('test');
    expect(res.results.dashboardId).toBe('abc');
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should get output true value from input', async () => {
    const res = await BooleanOutputNode.onNodeExecution(
      { name: 'test', description: '', dashboardId: 'abc' },
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
      { name: 'test', description: '', dashboardId: 'abc' },
      { value: null },
      null
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      { name: 'test', description: '', dashboardId: 'abc' },
      { value: { content: {}, isPresent: false } },
      null
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      { name: 'test', description: '', dashboardId: 'abc' },
      { value: { content: {}, isPresent: true } },
      null
    );
    expect(res).toEqual({});
  });
});
