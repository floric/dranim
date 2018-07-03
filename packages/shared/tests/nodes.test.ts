import { ContextNodeType, NodeState } from '../src/nodes';

describe('Nodes', () => {
  test('should have correct values in NodeState and ContextNodeType', async () => {
    expect(NodeState.ERROR).toBe('ERROR');
    expect(NodeState.VALID).toBe('VALID');
    expect(NodeState.INVALID).toBe('INVALID');

    expect(ContextNodeType.INPUT).toBe('ContextInputNode');
    expect(ContextNodeType.OUTPUT).toBe('ContextOutputNode');
  });
});
