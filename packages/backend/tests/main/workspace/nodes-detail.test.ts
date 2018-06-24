import {
  ContextNodeType,
  DataType,
  hasContextFn,
  NodeDef,
  NodeInstance,
  NodeState,
  ServerNodeDefWithContextFn
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { isNodeInMetaValid } from '../../../src/main/calculation/validation';
import {
  getNodeType,
  hasNodeType,
  tryGetNodeType
} from '../../../src/main/nodes/all-nodes';
import {
  getContextNode,
  getNode,
  tryGetNode
} from '../../../src/main/workspace/nodes';
import {
  addOrUpdateFormValue,
  getContextInputDefs,
  getContextOutputDefs,
  getNodeState
} from '../../../src/main/workspace/nodes-detail';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('@masterthesis/shared');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/nodes/all-nodes');
jest.mock('../../../src/main/calculation/validation');
jest.mock('../../../src/main/workspace/connections');

describe('Node Details', () => {
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
    (isNodeInMetaValid as jest.Mock).mockReturnValue(true);
    const state = await getNodeState(
      {
        id: VALID_OBJECT_ID,
        form: [],
        inputs: [],
        outputs: [],
        contextIds: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      db
    );

    expect(state).toBe(NodeState.VALID);
  });

  test('should get invalid node state', async () => {
    (isNodeInMetaValid as jest.Mock).mockReturnValue(false);
    const state = await getNodeState(
      {
        id: VALID_OBJECT_ID,
        form: [],
        inputs: [],
        outputs: [],
        contextIds: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      db
    );

    expect(state).toBe(NodeState.INVALID);
  });

  test('should get error node state', async () => {
    (isNodeInMetaValid as jest.Mock).mockImplementation(() => {
      throw new Error();
    });
    const state = await getNodeState(
      {
        id: VALID_OBJECT_ID,
        form: [],
        inputs: [],
        outputs: [],
        contextIds: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      db
    );

    expect(state).toBe(NodeState.ERROR);
  });

  test('should get null for nodes without contexts', async () => {
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
    (hasNodeType as jest.Mock).mockReturnValue(true);

    const inputRes = await getContextInputDefs(node, db);
    expect(inputRes).toBe(null);

    const outputRes = await getContextOutputDefs(node, db);
    expect(outputRes).toBe(null);
  });

  test('should throw error for missing parent node', async () => {
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
    (getNode as jest.Mock).mockResolvedValue(null);
    (hasNodeType as jest.Mock).mockReturnValue(false);

    try {
      await getContextInputDefs(node, db);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Parent node missing');
    }
  });

  test('should return null for non context node as parent (should never happen)', async () => {
    const parentNode: NodeInstance = {
      id: 'parentnode',
      contextIds: [],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const node: NodeInstance = {
      id: 'testnode',
      contextIds: [parentNode.id],
      form: [],
      inputs: [{ name: 'dataset', connectionId: '123' }],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    (getNode as jest.Mock).mockResolvedValue(parentNode);
    (hasNodeType as jest.Mock).mockReturnValue(false);

    const res = await getContextInputDefs(node, db);

    expect(res).toBe(null);
  });

  test('should get empty context inputs', async () => {
    const parentTypeName = 'p';
    const parentType: ServerNodeDefWithContextFn & NodeDef = {
      type: parentTypeName,
      name: parentTypeName,
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
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} }),
      transformContextInputDefsToContextOutputDefs: async () => ({}),
      transformInputDefsToContextInputDefs: async () => ({})
    };
    const parentNode: NodeInstance = {
      id: 'parentnode',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const inputNode: NodeInstance = {
      id: 'abc',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: ContextNodeType.INPUT,
      workspaceId: '123',
      x: 0,
      y: 0
    };
    (getNode as jest.Mock).mockResolvedValue(parentNode);
    (getNodeType as jest.Mock).mockReturnValue(parentType);
    (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
    (hasContextFn as jest.Mock).mockReturnValue(true);

    const inputRes = await getContextInputDefs(inputNode, db);
    expect(inputRes).toEqual({});
  });

  test('should get empty context outputs', async () => {
    const parentTypeName = 'p';
    const parentType: ServerNodeDefWithContextFn & NodeDef = {
      type: parentTypeName,
      name: parentTypeName,
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
      isFormValid: async () => false,
      onMetaExecution: async () => ({ test: { content: {}, isPresent: true } }),
      onNodeExecution: async () => ({ outputs: {} }),
      transformContextInputDefsToContextOutputDefs: async () => ({}),
      transformInputDefsToContextInputDefs: async () => ({})
    };
    const parentNode: NodeInstance = {
      id: 'parentnode',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: 'type',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    };
    const inputNode: NodeInstance = {
      id: 'abc',
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: ContextNodeType.INPUT,
      workspaceId: '123',
      x: 0,
      y: 0
    };
    (getNode as jest.Mock).mockResolvedValue(parentNode);
    (getNodeType as jest.Mock).mockReturnValue(parentType);
    (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
    (getContextNode as jest.Mock).mockResolvedValue(inputNode);
    (hasContextFn as jest.Mock).mockReturnValue(true);

    const outputRes = await getContextOutputDefs(inputNode, db);
    expect(outputRes).toEqual({});
  });

  test('should throw error for empty value names', async () => {
    try {
      await addOrUpdateFormValue(db, VALID_OBJECT_ID, '', 'test');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('No form value name specified');
    }
  });

  test('should throw error for invalid node id', async () => {
    (tryGetNode as jest.Mock).mockImplementation(() => {
      throw new Error('Node not found');
    });

    try {
      await addOrUpdateFormValue(db, VALID_OBJECT_ID, 'test', 'test');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Node not found');
    }
  });
});
