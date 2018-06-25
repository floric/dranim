import {
  ConnectionInstance,
  DataType,
  NodeDef,
  NodeInstance,
  ServerNodeDef
} from '@masterthesis/shared';

import {
  getMetaInputs,
  getMetaOutputs
} from '../../../src/main/calculation/meta-execution';
import { getNodeType } from '../../../src/main/nodes/all-nodes';
import { tryGetConnection } from '../../../src/main/workspace/connections';
import { tryGetNode } from '../../../src/main/workspace/nodes';
import { getInputDefs } from '../../../src/main/workspace/nodes-detail';

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
        y: 0
      },
      null
    );
    expect(res).toEqual({
      test: { content: {}, isPresent: false },
      abc: { content: {}, isPresent: false }
    });
  });

  test('should get for present metas', async () => {
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
          isDynamic: false
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
      y: 0
    };
    (getInputDefs as jest.Mock).mockResolvedValue({
      test: {
        dataType: DataType.STRING,
        displayName: 'blub'
      }
    });
    (tryGetConnection as jest.Mock).mockResolvedValueOnce(conn);
    (tryGetNode as jest.Mock).mockResolvedValueOnce(inputNode);
    (getNodeType as jest.Mock).mockReturnValueOnce(inputType);

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
        y: 0
      },
      null
    );
    expect(res).toEqual({
      test: { content: {}, isPresent: true }
    });
  });

  test('should get empty meta inputs for context nodes', async () => {
    const res = await getMetaOutputs(
      {
        id: 'abc',
        contextIds: [],
        form: [],
        inputs: [{ name: 'test', connectionId: 'id' }],
        outputs: [],
        type: 'type',
        workspaceId: '',
        x: 0,
        y: 0
      },
      null
    );
    expect(res).toEqual({});
  });
});
