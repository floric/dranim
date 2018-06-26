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
    const form = { name: 'test', description: 'desc', dashboardId: 'abc' };

    let res = await StringOutputNode.onNodeExecution(
      form,
      {
        value: inputValue
      },
      null
    );

    expect(res.results.value).toBe(inputValue);
    expect(res.results.type).toBe(DataType.STRING);
    expect(res.results.name).toBe('test');
    expect(res.results.dashboardId).toBe('abc');
    expect(res.results.description).toBe('desc');
    expect(Object.keys(res.outputs).length).toBe(0);

    res = await StringOutputNode.onNodeExecution(
      { name: 'test', description: null, dashboardId: 'abc' },
      {
        value: inputValue
      },
      null
    );

    expect(res.results.description).toBe('');
  });

  test('should return nothing onMetaExecution', async () => {
    const res = await StringOutputNode.onMetaExecution(
      { name: 'test', description: '', dashboardId: 'abc' },
      { value: { content: {}, isPresent: true } },
      null
    );

    expect(res).toEqual({});
  });
});
