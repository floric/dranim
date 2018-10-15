import { DataType, NodeState, NumberOutputNodeDef } from '@masterthesis/shared';

import { NumberOutputNode } from '../../../../src/main/nodes/number/output';

describe('NumberOutputNode', () => {
  test('should have correct properties', () => {
    expect(NumberOutputNode.type).toBe(NumberOutputNodeDef.type);
    expect(NumberOutputNode.isFormValid).toBeDefined();
    expect(NumberOutputNode.isInputValid).toBeUndefined();
    expect(NumberOutputNodeDef.isOutputNode).toBe(true);
  });

  test('should get output int value from input', async () => {
    let res = await NumberOutputNode.onNodeExecution(
      { name: 'test', description: 'desc' },
      {
        value: 2
      },
      {
        reqContext: null,
        node: {
          contextIds: [],
          form: {},
          id: 'abc',
          inputs: [],
          outputs: [],
          type: 'a',
          workspaceId: 'abc',
          variables: {},
          state: NodeState.VALID,
          x: 0,
          y: 0
        }
      }
    );

    expect(res.results.value).toBe(2);
    expect(res.results.type).toBe(DataType.NUMBER);
    expect(res.results.name).toBe('test');
    expect(res.results.description).toBe('desc');
    expect(Object.keys(res.outputs).length).toBe(0);

    res = await NumberOutputNode.onNodeExecution(
      { name: 'test', description: null },
      {
        value: 2
      },
      { node: { workspaceId: '' } } as any
    );
    expect(res.results.description).toBe('');
  });

  test('should get output negative float value from input', async () => {
    const res = await NumberOutputNode.onNodeExecution(
      { name: 'test', description: '' },
      {
        value: -2.34
      },
      { node: { workspaceId: '' } } as any
    );

    expect(res.results.value).toBe(-2.34);
    expect(Object.keys(res.outputs).length).toBe(0);
  });

  test('should always return empty object for onMetaExecution', async () => {
    let res = await NumberOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: null },
      { node: { workspaceId: '' } } as any
    );
    expect(res).toEqual({});

    res = await NumberOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: { content: {}, isPresent: false } },
      { node: { workspaceId: '' } } as any
    );
    expect(res).toEqual({});

    res = await NumberOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: { content: {}, isPresent: true } },
      { node: { workspaceId: '' } } as any
    );
    expect(res).toEqual({});
  });
});
