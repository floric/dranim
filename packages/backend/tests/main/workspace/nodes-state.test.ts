import {
  NodeInstance,
  NodeState,
  ServerNodeDef,
  NodeDef,
  hasContextFn,
  ContextNodeType
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { isNodeInMetaValid } from '../../../src/main/calculation/validation';
import {
  getNode,
  tryGetNode,
  tryGetContextNode,
  getNodesCollection
} from '../../../src/main/workspace/nodes';
import {
  calculateNodeState,
  updateState
} from '../../../src/main/workspace/nodes-state';
import { getTestMongoDb, VALID_OBJECT_ID } from '../../test-utils';
import { tryGetNodeType, getNodeType } from '../../../src/main/nodes/all-nodes';

let conn;
let db: Db;
let server;

jest.mock('@masterthesis/shared');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/nodes-detail');
jest.mock('../../../src/main/nodes/all-nodes');
jest.mock('../../../src/main/calculation/validation');
jest.mock('../../../src/main/workspace/connections');

describe('Node State', () => {
  beforeAll(async () => {
    const { connection, database, mongodbServer } = await getTestMongoDb();
    conn = connection;
    db = database;
    server = mongodbServer;
  });

  afterAll(async () => {
    await conn.close();
    await server.stop();
  });

  beforeEach(async () => {
    await db.dropDatabase();
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

    const state = await calculateNodeState(node.id, {
      db,
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

    const state = await calculateNodeState(node.id, {
      db,
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

    const state = await calculateNodeState(node.id, {
      db,
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
    const state = await calculateNodeState(node.id, {
      db,
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
    const state = await calculateNodeState(node.id, {
      db,
      userId: ''
    });

    expect(state).toBe(NodeState.ERROR);
  });

  test('should get node state with context function', async () => {
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
    const cNode: NodeInstance = {
      id: 'testnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
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

    const res = await calculateNodeState(node.id, { db, userId: '' });
    expect(res).toBe(NodeState.INVALID);
  });

  test('should update state', async () => {
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const cNode: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: ContextNodeType.OUTPUT,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (tryGetNode as jest.Mock)
      .mockReturnValueOnce(node)
      .mockReturnValueOnce(node)
      .mockReturnValueOnce(cNode)
      .mockReturnValueOnce(cNode);
    (hasContextFn as any).mockReturnValue(true);
    (tryGetContextNode as jest.Mock).mockResolvedValue(cNode);
    (getNodesCollection as jest.Mock).mockReturnValue({
      updateOne: jest.fn()
    });

    const res = await updateState(node.id, { db, userId: '' });
    expect(res).toBe(0);
    expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(9);
  });
});
