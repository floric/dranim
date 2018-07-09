import {
  ConnectionInstance,
  ContextNodeType,
  DataType,
  hasContextFn,
  NodeDef,
  NodeInstance,
  NodeState,
  ServerNodeDef,
  ServerNodeDefWithContextFn,
  SocketState
} from '@masterthesis/shared';

import {
  getMetaInputs,
  getMetaOutputs
} from '../../../src/main/calculation/meta-execution';
import { getNodeType, tryGetNodeType } from '../../../src/main/nodes/all-nodes';
import { tryGetConnection } from '../../../src/main/workspace/connections';
import { tryGetNode } from '../../../src/main/workspace/nodes';
import {
  getInputDefs,
  tryGetParentNode
} from '../../../src/main/workspace/nodes-detail';
import { NeverGoHereError } from '../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../src/main/workspace/nodes-detail');
jest.mock('../../../src/main/workspace/connections');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/nodes/all-nodes');

describe('Meta Execution', () => {
  test('should get for absent metas', async () => {
    (getInputDefs as jest.Mock).mockResolvedValue({
      test: {
        dataType: DataType.STRING,
        displayName: 'blub'
      },
      abc: {
        dataType: DataType.NUMBER,
        displayName: 'blub'
      }
    });
    const res = await getMetaInputs(
      {
        id: 'abc',
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: '',
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      null
    );
    expect(res).toEqual({
      test: { content: {}, isPresent: false },
      abc: { content: {}, isPresent: false }
    });
  });

  test('should get meta defs for present metas', async () => {
    const conn: ConnectionInstance = {
      workspaceId: '',
      contextIds: [],
      from: { name: 'test', nodeId: 'a' },
      to: { name: 'test', nodeId: 'b' },
      id: '123'
    };
    const inputType: ServerNodeDef & NodeDef = {
      type: 't',
      name: '',
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
      onMetaExecution: async () => ({ test: { content: {}, isPresent: true } }),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const inputNode: NodeInstance = {
      workspaceId: '',
      contextIds: [],
      id: '123',
      form: [],
      inputs: [],
      outputs: [{ name: 'test', connectionId: 'id' }],
      type: 't',
      x: 0,
      y: 0,
      state: NodeState.VALID
    };
    (getInputDefs as jest.Mock).mockResolvedValue({
      test: {
        dataType: DataType.STRING,
        displayName: 'blub'
      }
    });
    (tryGetConnection as jest.Mock).mockResolvedValueOnce(conn);
    (tryGetNode as jest.Mock).mockResolvedValueOnce(inputNode);
    (tryGetNodeType as jest.Mock).mockReturnValueOnce(inputType);

    const res = await getMetaInputs(
      {
        id: 'abc',
        contextIds: [],
        form: [],
        inputs: [{ name: 'test', connectionId: 'id' }],
        outputs: [],
        type: 'type',
        workspaceId: '',
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      null
    );
    expect(res).toEqual({
      test: { content: {}, isPresent: true }
    });
  });

  test('should get empty meta inputs for context output nodes', async () => {
    const res = await getMetaOutputs(
      {
        id: 'abc',
        contextIds: [],
        form: [],
        inputs: [{ name: 'test', connectionId: 'id' }],
        outputs: [],
        type: ContextNodeType.OUTPUT,
        workspaceId: '',
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      null
    );
    expect(res).toEqual({});
  });

  test('should get dynamic, present meta inputs for context input nodes', async () => {
    const parent: NodeInstance = {
      id: 'parent',
      x: 0,
      y: 0,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'p',
      workspaceId: '',
      state: NodeState.VALID
    };
    const parentType: ServerNodeDefWithContextFn & NodeDef = {
      type: 'test',
      inputs: {},
      outputs: {},
      keywords: [],
      path: [],
      name: 'test',
      onMetaExecution: () => Promise.resolve({}),
      onNodeExecution: () => Promise.resolve({ outputs: {} }),
      transformContextInputDefsToContextOutputDefs: () => Promise.resolve({}),
      transformInputDefsToContextInputDefs: () =>
        Promise.resolve({
          test: {
            dataType: DataType.DATETIME,
            displayName: 'date',
            state: SocketState.DYNAMIC
          },
          abc: {
            dataType: DataType.STRING,
            displayName: 'abc test',
            state: SocketState.DYNAMIC
          }
        })
    };
    (tryGetParentNode as jest.Mock).mockResolvedValue(parent);
    (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
    (hasContextFn as any).mockReturnValue(true);
    (getInputDefs as jest.Mock).mockResolvedValue({});

    const res = await getMetaOutputs(
      {
        id: 'abc',
        contextIds: [parent.id],
        form: [],
        inputs: [{ name: 'test', connectionId: 'id' }],
        outputs: [],
        type: ContextNodeType.INPUT,
        workspaceId: '',
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      null
    );
    expect(res).toEqual({
      abc: { content: {}, isPresent: true },
      test: { content: {}, isPresent: true }
    });
  });

  test('should throw error for parent node without context function', async () => {
    try {
      const parent: NodeInstance = {
        id: 'parent',
        x: 0,
        y: 0,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: 'p',
        workspaceId: '',
        state: NodeState.VALID
      };
      const parentType: ServerNodeDefWithContextFn & NodeDef = {
        type: 'test',
        inputs: {},
        outputs: {},
        keywords: [],
        path: [],
        name: 'test',
        onMetaExecution: () => Promise.resolve({}),
        onNodeExecution: () => Promise.resolve({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: () => Promise.resolve({}),
        transformInputDefsToContextInputDefs: () => Promise.resolve({})
      };
      (tryGetParentNode as jest.Mock).mockResolvedValue(parent);
      (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
      (hasContextFn as any).mockReturnValue(false);

      await getMetaOutputs(
        {
          id: 'abc',
          contextIds: [parent.id],
          form: [],
          inputs: [{ name: 'test', connectionId: 'id' }],
          outputs: [],
          type: ContextNodeType.INPUT,
          workspaceId: '',
          x: 0,
          y: 0,
          state: NodeState.VALID
        },
        null
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Should have context fn');
    }
  });
});
