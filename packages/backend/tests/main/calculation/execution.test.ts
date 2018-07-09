import {
  ConnectionInstance,
  ContextNodeType,
  DataType,
  hasContextFn,
  NodeDef,
  NodeInstance,
  NodeState,
  parseNodeForm,
  ServerNodeDef,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';

import {
  executeNode,
  executeNodeWithId
} from '../../../src/main/calculation/execution';
import {
  areNodeInputsValid,
  isNodeInMetaValid
} from '../../../src/main/calculation/validation';
import { tryGetNodeType } from '../../../src/main/nodes/all-nodes';
import { tryGetConnection } from '../../../src/main/workspace/connections';
import {
  tryGetContextNode,
  tryGetNode
} from '../../../src/main/workspace/nodes';
import { NeverGoHereError, VALID_OBJECT_ID } from '../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../src/main/workspace/workspace');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/calculation/validation');
jest.mock('../../../src/main/nodes/all-nodes');
jest.mock('../../../src/main/workspace/connections');

describe('Execution', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  test('should execute simple node', async () => {
    const node: NodeInstance = {
      id: 'node',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const type: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'a',
      inputs: {
        value: {
          dataType: DataType.STRING,
          displayName: 'value',
          isDynamic: false
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    (tryGetNode as jest.Mock).mockResolvedValue(node);
    (tryGetNodeType as jest.Mock).mockReturnValue(type);
    (parseNodeForm as jest.Mock).mockReturnValue({});
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);

    const { outputs, results } = await executeNodeWithId(VALID_OBJECT_ID, {
      db: null,
      userId: ''
    });

    expect(outputs).toBeDefined();
    expect(results).toBeUndefined();
  });

  test('should execute connected nodes', async () => {
    const connectionId = '123';
    const nodeA: NodeInstance = {
      id: 'nodeA',
      contextIds: [],
      form: [{ name: 'value', value: JSON.stringify('test') }],
      inputs: [{ name: 'a', connectionId }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeB: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: [{ name: 'name', value: JSON.stringify('test') }],
      inputs: [],
      outputs: [{ name: 'a', connectionId }],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const typeA: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'a',
      inputs: {
        a: {
          dataType: DataType.STRING,
          displayName: 'value',
          isDynamic: false
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const typeB: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'b',
      inputs: {},
      outputs: {
        a: {
          dataType: DataType.STRING,
          displayName: 'value',
          isDynamic: false
        }
      },
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: { a: 1 } })
    };
    const conn: ConnectionInstance = {
      from: { name: 'a', nodeId: nodeA.id },
      to: { name: 'a', nodeId: nodeB.id },
      id: connectionId,
      workspaceId: VALID_OBJECT_ID,
      contextIds: []
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB);
    (tryGetNodeType as jest.Mock)
      .mockReturnValueOnce(typeA)
      .mockReturnValueOnce(typeB);
    (parseNodeForm as jest.Mock).mockReturnValue({});
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (tryGetConnection as jest.Mock).mockResolvedValue(conn);

    const res = await executeNodeWithId(nodeB.id, {
      db: null,
      userId: ''
    });

    expect(res).toEqual({ outputs: { a: 1 } });
  });

  test('should return outputs from context for context input nodes', async () => {
    const contextInputs = { test: 123 };
    const res = await executeNode(
      {
        type: ContextNodeType.INPUT,
        x: 0,
        y: 0,
        workspaceId: VALID_OBJECT_ID,
        id: VALID_OBJECT_ID,
        outputs: [],
        inputs: [],
        form: [],
        contextIds: [VALID_OBJECT_ID],
        state: NodeState.VALID
      },
      { db: null, userId: '' },
      contextInputs
    );
    expect(res).toEqual({ outputs: contextInputs });
  });

  test('should throw error for unknown node type', async () => {
    const node: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    (tryGetNode as jest.Mock).mockResolvedValue(node);
    (tryGetNodeType as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown node type: UnknownNodeType');
    });
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);

    try {
      await executeNode(
        {
          type: 'UnknownNodeType',
          x: 0,
          y: 0,
          workspaceId: VALID_OBJECT_ID,
          id: VALID_OBJECT_ID,
          outputs: [],
          inputs: [],
          form: [],
          contextIds: [VALID_OBJECT_ID],
          state: NodeState.VALID
        },
        { db: null, userId: '' }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node type: UnknownNodeType');
    }
  });

  test('should fail for invalid form', async () => {
    const node: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    (tryGetNode as jest.Mock).mockResolvedValue(node);
    (tryGetNodeType as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown node type: UnknownNodeType');
    });
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(false);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);

    try {
      await executeNode(node, { db: null, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Form values or inputs are missing');
    }
  });

  test('should fail for invalid input', async () => {
    const node: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const type: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'b',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    (tryGetNode as jest.Mock).mockResolvedValue(node);
    (tryGetNodeType as jest.Mock).mockReturnValue(type);
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(false);

    try {
      await executeNode(node, { db: null, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Execution inputs are not valid');
    }
  });

  test('should wait for inputs and combine them as sum', async () => {
    const connAId = '123';
    const connBId = '456';
    const nodeA: NodeInstance = {
      id: 'nodeA',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [{ name: 'a', connectionId: connBId }],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const nodeB: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [{ name: 'b', connectionId: connAId }],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const sumNode: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: [],
      inputs: [
        { name: 'a', connectionId: connAId },
        { name: 'b', connectionId: connBId }
      ],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const typeA: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'a',
      inputs: {},
      outputs: {
        a: {
          dataType: DataType.STRING,
          displayName: 'value',
          isDynamic: false
        }
      },
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: { c: 3 } })
    };
    const typeB: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'b',
      inputs: {},
      outputs: {
        b: {
          dataType: DataType.STRING,
          displayName: 'value',
          isDynamic: false
        }
      },
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: { b: 2 } })
    };
    const sumType: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'b',
      inputs: {
        a: {
          dataType: DataType.STRING,
          displayName: 'value',
          isDynamic: false
        },
        b: {
          dataType: DataType.STRING,
          displayName: 'value',
          isDynamic: false
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: { a: 1 } })
    };
    const connA: ConnectionInstance = {
      from: { name: 'a', nodeId: nodeB.id },
      to: { name: 'a', nodeId: sumNode.id },
      id: connAId,
      workspaceId: VALID_OBJECT_ID,
      contextIds: []
    };
    const connB: ConnectionInstance = {
      from: { name: 'b', nodeId: nodeA.id },
      to: { name: 'b', nodeId: sumNode.id },
      id: connBId,
      workspaceId: VALID_OBJECT_ID,
      contextIds: []
    };

    (tryGetNode as jest.Mock)
      .mockResolvedValueOnce(nodeA)
      .mockResolvedValueOnce(nodeB);
    (tryGetNodeType as jest.Mock)
      .mockReturnValueOnce(typeA)
      .mockReturnValueOnce(typeB)
      .mockReturnValueOnce(sumType);
    (parseNodeForm as jest.Mock).mockReturnValue({});
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (tryGetConnection as jest.Mock)
      .mockResolvedValueOnce(connA)
      .mockResolvedValueOnce(connB);

    const res = await executeNode(sumNode, {
      db: null,
      userId: ''
    });

    expect(res).toEqual({ outputs: { a: 1 } });
  });

  test('should support context functions', async () => {
    const node: NodeInstance = {
      id: 'node',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const cNode: NodeInstance = {
      id: 'cNode',
      contextIds: [],
      form: [],
      inputs: [{ connectionId: 'c', name: 'x' }],
      outputs: [],
      type: ContextNodeType.OUTPUT,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const iNode: NodeInstance = {
      id: 'iNode',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [{ connectionId: 'c', name: 'x' }],
      type: 'a',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    const type: ServerNodeDefWithContextFn & NodeDef = {
      type: 'type',
      name: 'a',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      transformContextInputDefsToContextOutputDefs: async () => ({}),
      transformInputDefsToContextInputDefs: async () => ({}),
      onMetaExecution: async () => ({}),
      onNodeExecution: async (form, inputs, { contextFnExecution }) => ({
        outputs: { a: (await contextFnExecution({})).outputs }
      })
    };
    const cType: ServerNodeDef & NodeDef = {
      type: ContextNodeType.OUTPUT,
      name: 'a',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({
        outputs: { x: 1 }
      })
    };
    const conn: ConnectionInstance = {
      contextIds: [],
      from: {
        name: 'x',
        nodeId: iNode.id
      },
      to: {
        name: 'x',
        nodeId: cNode.id
      },
      id: '123',
      workspaceId: VALID_OBJECT_ID
    };
    (tryGetNode as jest.Mock).mockResolvedValue(node);
    (tryGetContextNode as jest.Mock).mockResolvedValue(cNode);
    (tryGetNodeType as jest.Mock)
      .mockReturnValueOnce(type)
      .mockReturnValueOnce(cType);
    (tryGetConnection as jest.Mock).mockResolvedValue(conn);
    (parseNodeForm as jest.Mock).mockReturnValue({});
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (hasContextFn as any)
      .mockReturnValueOnce(true)
      .mockResolvedValueOnce(false);

    const res = await executeNode(node, {
      db: null,
      userId: ''
    });
    expect(res).toEqual({ outputs: { a: { x: 1 } } });
  });

  test('should throw error', async () => {
    const node: NodeInstance = {
      id: 'node',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: ContextNodeType.INPUT,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    (tryGetNode as jest.Mock).mockResolvedValue(node);

    try {
      await executeNode(node, {
        db: null,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Context needs context inputs');
    }
  });
});
