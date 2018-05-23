import { DatasetInputNodeDef } from '@masterthesis/shared';
import { DatasetInputNode } from '../../../../src/main/nodes/dataset/InputNode';

describe('DatasetInputNode', () => {
  test('should have correct properties', () => {
    expect(DatasetInputNode.name).toBe(DatasetInputNodeDef.name);
    expect(DatasetInputNode.isFormValid).toBeDefined();
    expect(DatasetInputNode.isInputValid).toBeUndefined();
  });

  test('should get output value from form', async () => {
    const dsId = 'abc-cde';
    const res = await DatasetInputNode.onServerExecution({ dataset: dsId }, {});
    expect(res.outputs.dataset).toBe(dsId);
  });
});
