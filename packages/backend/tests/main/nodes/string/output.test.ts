import { DataType, StringOutputNodeDef } from '@masterthesis/shared';

import { StringOutputNode } from '../../../../src/main/nodes/string/output';

describe('StringOutputNode', () => {
  test('should have correct properties', () => {
    expect(StringOutputNode.type).toBe(StringOutputNodeDef.type);
    expect(StringOutputNode.isFormValid).toBeDefined();
    expect(StringOutputNode.isInputValid).toBeUndefined();
    expect(StringOutputNodeDef.isOutputNode).toBe(true);
  });

  test('should get output value from input', async () => {
    const inputValue = 'a huge text';
    const form = { name: 'test', description: 'desc' };

    let res = await StringOutputNode.onNodeExecution(
      form,
      {
        value: inputValue
      },
      {
        reqContext: null,
        node: {
          contextIds: [],
          form: [],
          id: 'abc',
          inputs: [],
          outputs: [],
          type: 'a',
          workspaceId: 'abc',
          x: 0,
          y: 0
        }
      }
    );

    expect(res.results.value).toBe(inputValue);
    expect(res.results.type).toBe(DataType.STRING);
    expect(res.results.name).toBe('test');
    expect(res.results.workspaceId).toBe('abc');
    expect(res.results.description).toBe('desc');
    expect(Object.keys(res.outputs).length).toBe(0);

    res = await StringOutputNode.onNodeExecution(
      { name: 'test', description: null },
      {
        value: inputValue
      },
      {
        reqContext: null,
        node: {
          contextIds: [],
          form: [],
          id: 'abc',
          inputs: [],
          outputs: [],
          type: 'a',
          workspaceId: 'abc',
          x: 0,
          y: 0
        }
      }
    );

    expect(res.results.description).toBe('');
  });

  test('should return nothing onMetaExecution', async () => {
    const res = await StringOutputNode.onMetaExecution(
      { name: 'test', description: '' },
      { value: { content: {}, isPresent: true } },
      null
    );

    expect(res).toEqual({});
  });
});
