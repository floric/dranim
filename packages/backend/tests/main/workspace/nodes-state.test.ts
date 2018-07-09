import {
  ContextNodeType,
  hasContextFn,
  NodeDef,
  NodeInstance,
  NodeState,
  ServerNodeDef
} from '@masterthesis/shared';

import { isNodeInMetaValid } from '../../../src/main/calculation/validation';
import { getNodeType, tryGetNodeType } from '../../../src/main/nodes/all-nodes';
import {
  getNode,
  getNodesCollection,
  tryGetContextNode,
  tryGetNode
} from '../../../src/main/workspace/nodes';
import {
  calculateNodeState,
  updateState
} from '../../../src/main/workspace/nodes-state';
import { VALID_OBJECT_ID } from '../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/nodes-detail');
jest.mock('../../../src/main/nodes/all-nodes');
jest.mock('../../../src/main/calculation/validation');

describe('Node State', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  test('should get valid node state', async () => {
    const node: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (tryGetNode as jest.Mock).mockReturnValue(node);
    (isNodeInMetaValid as jest.Mock).mockReturnValue(true);

    const state = await calculateNodeState(node, {
      db: null,
      userId: ''
    });

    expect(state).toBe(NodeState.VALID);
  });

  test('should get valid node state for ContextInputNode', async () => {
    const node: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (tryGetNode as jest.Mock).mockReturnValue(node);
    const parentNode: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (isNodeInMetaValid as jest.Mock).mockReturnValue(true);
    (getNode as jest.Mock).mockReturnValue(parentNode);

    const state = await calculateNodeState(node, {
      db: null,
      userId: ''
    });

    expect(state).toBe(NodeState.VALID);
  });

  test('should get valid node state for ContextOutputNode', async () => {
    const node: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (tryGetNode as jest.Mock).mockReturnValue(node);
    const parentNode: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (isNodeInMetaValid as jest.Mock).mockReturnValue(true);
    (getNode as jest.Mock).mockReturnValue(parentNode);

    const state = await calculateNodeState(node, {
      db: null,
      userId: ''
    });

    expect(state).toBe(NodeState.VALID);
  });

  test('should get invalid node state', async () => {
    const node: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (tryGetNode as jest.Mock).mockReturnValue(node);
    (isNodeInMetaValid as jest.Mock).mockReturnValue(false);
    const state = await calculateNodeState(node, {
      db: null,
      userId: ''
    });

    expect(state).toBe(NodeState.INVALID);
  });

  test('should get error node state', async () => {
    const node: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (tryGetNode as jest.Mock).mockReturnValue(node);
    (isNodeInMetaValid as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const state = await calculateNodeState(node, {
      db: null,
      userId: ''
    });

    expect(state).toBe(NodeState.ERROR);
  });

  test('should get node state with context function', async () => {
    const node: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const cNode: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: ContextNodeType.OUTPUT,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const type: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 't',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const parentType: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 't',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    (tryGetNode as jest.Mock)
      .mockReturnValueOnce(node)
      .mockReturnValueOnce(cNode);
    (isNodeInMetaValid as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    (getNodeType as jest.Mock)
      .mockReturnValueOnce(type)
      .mockReturnValueOnce(parentType);
    (hasContextFn as any).mockReturnValue(true);
    (tryGetContextNode as jest.Mock).mockResolvedValue(cNode);

    const res = await calculateNodeState(node, { db: null, userId: '' });
    expect(res).toBe(NodeState.INVALID);
  });

  test('should update state for simple node', async () => {
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const type: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 't',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    (isNodeInMetaValid as jest.Mock).mockReturnValue(true);
    (getNodeType as jest.Mock).mockReturnValueOnce(type);

    (tryGetNodeType as jest.Mock).mockReturnValueOnce(type);
    (tryGetNode as jest.Mock).mockReturnValueOnce(node);
    (hasContextFn as any).mockReturnValue(false);
    (getNodesCollection as jest.Mock).mockReturnValue({
      updateOne: jest.fn()
    });

    const res = await updateState(node, { db: null, userId: '' });
    expect(res).toBe(true);
    expect(getNodesCollection(null).updateOne).toHaveBeenCalledTimes(1);
    expect(hasContextFn).toHaveBeenCalledTimes(2);
  });

  test('should update state for node with context', async () => {
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const type: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 't',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const cNode: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const cType: ServerNodeDef & NodeDef = {
      type: ContextNodeType.OUTPUT,
      name: 't',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    (isNodeInMetaValid as jest.Mock).mockReturnValue(true);
    (getNodeType as jest.Mock)
      .mockReturnValueOnce(type)
      .mockReturnValueOnce(cType);
    (tryGetContextNode as jest.Mock).mockResolvedValue(cNode);

    (tryGetNodeType as jest.Mock).mockReturnValueOnce(type);
    (tryGetNode as jest.Mock).mockReturnValueOnce(node);
    (hasContextFn as any)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    (getNodesCollection as jest.Mock).mockReturnValue({
      updateOne: jest.fn()
    });

    const res = await updateState(node, { db: null, userId: '' });
    expect(res).toBe(true);
    expect(getNodesCollection(null).updateOne).toHaveBeenCalledTimes(1);
    expect(hasContextFn).toHaveBeenCalledTimes(3);
  });
});
