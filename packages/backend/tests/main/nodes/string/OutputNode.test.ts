import {
  DatasetOutputNodeDef,
  IOValues,
  NodeInstance,
  NodeState,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  ProcessState,
  StringOutputNodeDef
} from '@masterthesis/shared';
import { StringOutputNode } from '../../../../src/main/nodes/string/OutputNode';

describe('StringOutputNode', () => {
  test('should have correct properties', () => {
    expect(StringOutputNode.name).toBe(StringOutputNodeDef.name);
    expect(StringOutputNode.isFormValid).toBeUndefined();
    expect(StringOutputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from input', async () => {
    const inputValue = 'a huge text';
    const form = { value: inputValue };

    const res = await StringOutputNode.onServerExecution(form, {
      string: inputValue
    });

    expect(res.results.value).toBe(inputValue);
    expect(Object.keys(res.outputs).length).toBe(0);
  });
});
