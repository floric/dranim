import {
  getNodeType,
  hasNodeType,
  tryGetNodeType
} from '../../../src/main/nodes/all-nodes';
import { StringInputNode } from '../../../src/main/nodes/string';
import { NeverGoHereError } from '../../test-utils';

describe('All Nodes', () => {
  test('should get StringInputNode type', () => {
    const type = getNodeType(StringInputNode.type);
    expect(type.type).toBe(StringInputNode.type);
  });

  test('should have StringInputNode type', () => {
    const res = hasNodeType(StringInputNode.type);
    expect(res).toBe(true);
  });

  test('should get null for unknown type', () => {
    const res = getNodeType('unknown');
    expect(res).toBe(null);
  });

  test('should not have unknown type', () => {
    const res = hasNodeType('unknown');
    expect(res).toBe(false);
  });

  test('should get StringInputNode type without error', () => {
    tryGetNodeType(StringInputNode.type);
  });

  test('should throw error for unknown node type', () => {
    try {
      tryGetNodeType('unknown');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node type: unknown');
    }
  });
});
