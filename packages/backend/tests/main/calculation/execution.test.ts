import {
  ConnectionInstance,
  ContextNodeType,
  DataType,
  NodeDef,
  NodeInstance,
  NodeState,
  ProcessState,
  ServerNodeDef,
  ServerNodeDefWithContextFn,
  SocketState,
  InMemoryCache
} from '@masterthesis/shared';

import { executeNode } from '../../../src/main/calculation/execution';
import { tryGetCalculation } from '../../../src/main/calculation/start-process';
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

jest.mock('../../../src/main/workspace/workspace');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/calculation/validation');
jest.mock('../../../src/main/nodes/all-nodes');
jest.mock('../../../src/main/workspace/connections');
jest.mock('../../../src/main/calculation/start-process');

describe('Execution', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should execute simple node', async () => {
    const node: NodeInstance = {
      id: 'node',
      contextIds: [],
      form: {},
      inputs: [],
      outputs: [],
      type: 'type',
      progress: null,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      variables: {}
    };
    const type: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'a',
      inputs: {
        value: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
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
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (tryGetCalculation as jest.Mock).mockResolvedValue({
      state: ProcessState.PROCESSING
    });

    const { outputs, results } = await executeNode(node, VALID_OBJECT_ID, {
      db: null,
      userId: '',
      cache: new InMemoryCache()
    });

    expect(outputs).toBeDefined();
    expect(results).toBeUndefined();
  });

  test('should execute connected nodes', async () => {
    const connectionId = '123';
    const nodeA: NodeInstance = {
      id: 'nodeA',
      contextIds: [],
      form: { value: '"test"' },
      inputs: [],
      outputs: [{ name: 'a', connectionId }],
      type: 'typeA',
      progress: null,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      variables: {}
    };
    const nodeB: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: {},
      inputs: [{ name: 'a', connectionId }],
      outputs: [],
      type: 'typeB',
      progress: null,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      variables: {}
    };
    const typeA: ServerNodeDef<{}, { a: string }, { value: string }> &
      NodeDef = {
      type: 'typeA',
      name: 'a',
      inputs: {},
      outputs: {
        a: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
        }
      },
      keywords: [],
      path: [],
      onMetaExecution: async () => ({ a: { content: {}, isPresent: true } }),
      onNodeExecution: async form => ({ outputs: { a: form.value } })
    };
    const typeB: ServerNodeDef<{ a: string }, {}, {}> & NodeDef = {
      type: 'typeB',
      name: 'b',
      inputs: {
        a: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async (form, inputs) => ({
        outputs: {},
        results: {
          value: inputs.a,
          description: '',
          name: 'z',
          type: DataType.STRING
        }
      })
    };
    const conn: ConnectionInstance = {
      from: { name: 'a', nodeId: nodeA.id },
      to: { name: 'a', nodeId: nodeB.id },
      id: connectionId,
      workspaceId: VALID_OBJECT_ID,
      contextIds: []
    };

    (tryGetNode as jest.Mock).mockImplementation(id =>
      Promise.resolve(id === nodeA.id ? nodeA : nodeB)
    );
    (tryGetNodeType as jest.Mock).mockImplementation(
      type => (type === typeA.type ? typeA : typeB)
    );
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (tryGetConnection as jest.Mock).mockResolvedValue(conn);
    (tryGetCalculation as jest.Mock).mockResolvedValue({
      state: ProcessState.PROCESSING
    });

    const res = await executeNode(nodeB, VALID_OBJECT_ID, {
      db: null,
      userId: '',
      cache: new InMemoryCache()
    });

    expect(res).toEqual({
      outputs: {},
      results: {
        description: '',
        name: 'z',
        type: DataType.STRING,
        value: 'test'
      }
    });
    expect(tryGetNode).toHaveBeenCalledTimes(1);
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
        progress: null,
        outputs: [],
        inputs: [],
        form: {},
        contextIds: [VALID_OBJECT_ID],
        state: NodeState.VALID,
        variables: {}
      },
      VALID_OBJECT_ID,
      { db: null, userId: '', cache: new InMemoryCache() },
      contextInputs
    );
    expect(res).toEqual({ outputs: contextInputs });
  });

  test('should throw error for unknown node type', async () => {
    const node: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: {},
      inputs: [],
      outputs: [],
      type: 'type',
      progress: null,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      variables: {}
    };
    (tryGetNode as jest.Mock).mockResolvedValue(node);
    (tryGetNodeType as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown node type: UnknownNodeType');
    });
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (tryGetCalculation as jest.Mock).mockResolvedValue({
      state: ProcessState.PROCESSING
    });

    try {
      await executeNode(
        {
          type: 'UnknownNodeType',
          x: 0,
          y: 0,
          workspaceId: VALID_OBJECT_ID,
          id: VALID_OBJECT_ID,
          progress: null,
          outputs: [],
          inputs: [],
          form: {},
          contextIds: [VALID_OBJECT_ID],
          state: NodeState.VALID,
          variables: {}
        },
        VALID_OBJECT_ID,
        { db: null, userId: '', cache: new InMemoryCache() }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node type: UnknownNodeType');
    }
  });

  test('should fail for invalid input', async () => {
    const node: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: {},
      progress: null,
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      variables: {}
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
    (tryGetCalculation as jest.Mock).mockResolvedValue({
      state: ProcessState.PROCESSING
    });

    try {
      await executeNode(node, VALID_OBJECT_ID, {
        db: null,
        userId: '',
        cache: new InMemoryCache()
      });
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
      form: {},
      inputs: [],
      outputs: [{ name: 'a', connectionId: connBId }],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      progress: null,
      variables: {}
    };
    const nodeB: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: {},
      inputs: [],
      outputs: [{ name: 'b', connectionId: connAId }],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      progress: null,
      variables: {}
    };
    const sumNode: NodeInstance = {
      id: 'nodeB',
      contextIds: [],
      form: {},
      inputs: [
        { name: 'a', connectionId: connAId },
        { name: 'b', connectionId: connBId }
      ],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      progress: null,
      variables: {}
    };
    const typeA: ServerNodeDef & NodeDef = {
      type: 'type',
      name: 'a',
      inputs: {},
      outputs: {
        a: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
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
          state: SocketState.STATIC
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
          state: SocketState.STATIC
        },
        b: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
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
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (tryGetConnection as jest.Mock)
      .mockResolvedValueOnce(connA)
      .mockResolvedValueOnce(connB);
    (tryGetCalculation as jest.Mock).mockResolvedValue({
      state: ProcessState.PROCESSING
    });

    const res = await executeNode(sumNode, VALID_OBJECT_ID, {
      db: null,
      userId: '',
      cache: new InMemoryCache()
    });

    expect(res).toEqual({ outputs: { a: 1 } });
    expect(tryGetNode).toHaveBeenCalledTimes(2);
  });

  test('should support context functions', async () => {
    const node: NodeInstance = {
      id: 'node',
      contextIds: [],
      form: {},
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      progress: null,
      variables: {}
    };
    const cNode: NodeInstance = {
      id: 'cNode',
      contextIds: [],
      form: {},
      inputs: [{ connectionId: 'c', name: 'x' }],
      outputs: [],
      type: ContextNodeType.OUTPUT,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      progress: null,
      variables: {}
    };
    const iNode: NodeInstance = {
      id: 'iNode',
      contextIds: [],
      form: {},
      inputs: [],
      outputs: [{ connectionId: 'c', name: 'x' }],
      type: 'a',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID,
      progress: null,
      variables: {}
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
    (isNodeInMetaValid as jest.Mock).mockResolvedValue(true);
    (areNodeInputsValid as jest.Mock).mockResolvedValue(true);
    (tryGetCalculation as jest.Mock).mockResolvedValue({
      state: ProcessState.PROCESSING
    });

    const res = await executeNode(node, VALID_OBJECT_ID, {
      db: null,
      userId: '',
      cache: new InMemoryCache()
    });
    expect(res).toEqual({ outputs: { a: { x: 1 } } });
  });
});
