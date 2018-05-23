import {
  ProcessState,
  NodeInstance,
  NodeState,
  NumberOutputNodeDef,
  NumberInputNodeDef,
  DatasetOutputNodeDef,
  IOValues,
  StringInputNodeDef
} from '@masterthesis/shared';
import { StringInputNode } from '../../../../src/main/nodes/string/InputNode';

describe('StringInputNode', () => {
  test('should have correct properties', () => {
    expect(StringInputNode.name).toBe(StringInputNodeDef.name);
    expect(StringInputNode.isFormValid).toBeUndefined();
    expect(StringInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form', async () => {
    const inputValue = 'a huge text';
    const form = { value: inputValue };

    const res = await StringInputNode.onServerExecution(form, {});

    expect(res.outputs.string).toBe(inputValue);
  });
});
