import { NodeInstance, NodeState } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { isNodeInMetaValid } from '../../../src/main/calculation/validation';
import { getNode, tryGetNode } from '../../../src/main/workspace/nodes';
import { calculateNodeState } from '../../../src/main/workspace/nodes-state';
import { getTestMongoDb, VALID_OBJECT_ID } from '../../test-utils';

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
});
