import {
  JoinDatasetsNodeDef,
  NodeState,
  NumberInputNodeDef,
  StringInputNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  addOrUpdateFormValue,
  createNode,
  deleteNode,
  getAllNodes,
  getNode,
  getNodesCollection,
  getNodeState,
  updateNode
} from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

describe('Nodes', () => {
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

  test('should create and get node', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const newNode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      null,
      0,
      0
    );

    expect(newNode.id).toBeDefined();
    expect(newNode.outputs).toEqual([]);
    expect(newNode.inputs).toEqual([]);
    expect(newNode.workspaceId).toBe(ws.id);
    expect(newNode.type).toBe(NumberInputNodeDef.name);

    const node = await getNode(db, newNode.id);

    expect(node).toEqual(newNode);
  });

  test('should create and get node in context', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const contextNode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      null,
      0,
      0
    );
    const newNode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      contextNode.id,
      0,
      0
    );

    expect(newNode.id).toBeDefined();
    expect(newNode.outputs).toEqual([]);
    expect(newNode.inputs).toEqual([]);
    expect(newNode.workspaceId).toBe(ws.id);
    expect(newNode.contextId).toBe(contextNode.id);
    expect(newNode.type).toBe(NumberInputNodeDef.name);

    const node = await getNode(db, newNode.id);

    expect(node).toEqual(newNode);
  });

  test('should not get invalid node', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const unknownNode = await getNode(db, '123');

    expect(unknownNode).toBe(null);
  });

  test('should get valid node state', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      null,
      0,
      0
    );
    await addOrUpdateFormValue(db, node.id, 'value', '1');
    const updatedNode = await getNode(db, node.id);

    const state = await getNodeState(updatedNode);

    expect(state).toBe(NodeState.VALID);
  });

  test('should get invalid node state', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      null,
      0,
      0
    );

    const state = await getNodeState(node);

    expect(state).toBe(NodeState.INVALID);
  });

  test('should get error node state', async () => {
    const state = await getNodeState({
      id: VALID_OBJECT_ID,
      form: [],
      inputs: [],
      outputs: [],
      state: NodeState.VALID,
      contextId: null,
      type: 'unknown',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0
    });

    expect(state).toBe(NodeState.ERROR);
  });

  test('should not create node for unknown workspace', async () => {
    try {
      await createNode(db, NumberInputNodeDef.name, '123', null, 0, 0);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown workspace');
    }
  });

  test('should not create node for unknown context node', async () => {
    const ws = await createWorkspace(db, 'test', '');
    try {
      await createNode(
        db,
        NumberInputNodeDef.name,
        ws.id,
        VALID_OBJECT_ID,
        0,
        0
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown context node');
    }
  });

  test('should create and delete node', async () => {
    const ws = await createWorkspace(db, 'test', '');

    let nrOfNodes = await getNodesCollection(db).count({});
    expect(nrOfNodes).toBe(0);

    const newNode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      null,
      0,
      0
    );

    expect(newNode).not.toBe(null);

    nrOfNodes = await getNodesCollection(db).count({});
    expect(nrOfNodes).toBe(1);

    const res = await deleteNode(db, newNode.id);
    expect(res).toBe(true);

    nrOfNodes = await getNodesCollection(db).count({});
    expect(nrOfNodes).toBe(0);
  });

  test('should not delete unknown node', async () => {
    try {
      const ws = await deleteNode(db, 'abc');
      throw NeverGoHereError;
    } catch (err) {
      expect(err).toEqual(new Error('Invalid ID'));
    }
  });

  test('should update node and change x and y', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const createdNode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      null,
      0,
      0
    );

    const newPos = [123, 456];
    const res = await updateNode(db, createdNode.id, newPos[0], newPos[1]);
    expect(res).toBe(true);

    const updatedNode = await getNode(db, createdNode.id);

    expect(updatedNode.x).toBe(newPos[0]);
    expect(updatedNode.y).toBe(newPos[1]);
    expect(updatedNode.workspaceId).toBe(ws.id);
    expect(updatedNode.type).toBe(NumberInputNodeDef.name);
  });

  test('should get all nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const nodes = await Promise.all([
      createNode(db, NumberInputNodeDef.name, ws.id, null, 0, 0),
      createNode(db, StringInputNodeDef.name, ws.id, null, 0, 0),
      createNode(db, JoinDatasetsNodeDef.name, ws.id, null, 0, 0)
    ]);

    const allNodes = await getAllNodes(db, ws.id);
    nodes.forEach(n => expect(allNodes).toContainEqual(n));
  });

  test('should throw error for invalid node type', async () => {
    const ws = await createWorkspace(db, 'test', '');

    try {
      await createNode(db, 'unknown', ws.id, null, 0, 0);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid node type');
    }
  });
});
