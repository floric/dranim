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
    let res = await BooleanOutputNode.onNodeExecution(
      { name: 'test', description: 'desc' },
      {
        value: true
      },
      { node: { workspaceId: 'abc' } } as any
    );

    expect(res.results.value).toBe(true);
    expect(res.results.type).toBe(DataType.BOOLEAN);
    expect(res.results.name).toBe('test');
    expect(res.results.description).toBe('desc');
    expect(Object.keys(res.outputs).length).toBe(0);

    res = await BooleanOutputNode.onNodeExecution(
      { name: 'test', description: null },
      {
        value: true
      },
      { node: { workspaceId: '' } } as any
    );

    expect(res.results.description).toBe('');
  });

  test('should get output true value from input', async () => {
    const res = await BooleanOutputNode.onNodeExecution(
      { name: 'test', description: '' },
      {
        value: false
      },
      { node: { workspaceId: '' } } as any
    );

    expect(res.results.value).toBe(false);
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should always return empty object for onMetaExecution', async () => {
    let res = await BooleanOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: null },
      { node: { workspaceId: '' } } as any
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: { content: {}, isPresent: false } },
      { node: { workspaceId: '' } } as any
    );
    expect(res).toEqual({});

    res = await BooleanOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: { content: {}, isPresent: true } },
      { node: { workspaceId: '' } } as any
    );
    expect(res).toEqual({});
  });
});
