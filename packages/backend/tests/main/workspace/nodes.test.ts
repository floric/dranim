import {
  DatasetOutputNodeDef,
  IOValues,
  JoinDatasetsNodeDef,
  NodeInstance,
  NodeState,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  ProcessState,
  StringInputNodeDef,
  Workspace
} from '@masterthesis/shared';
import { Db, MongoClient } from 'mongodb';

import { all } from 'async';
import {
  createNode,
  deleteNode,
  getAllNodes,
  getNode,
  getNodesCollection,
  updateNode
} from '../../../src/main/workspace/nodes';
import {
  createWorkspace,
  getWorkspace,
  getWorkspacesCollection
} from '../../../src/main/workspace/workspace';
import { NeverGoHereError } from '../../test-utils';

let connection;
let db: Db;

describe('Nodes', () => {
  beforeAll(async () => {
    connection = await MongoClient.connect((global as any).__MONGO_URI__);
    db = await connection.db((global as any).__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should create and get node', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const newNode = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);

    expect(newNode.id).toBeDefined();
    expect(newNode.outputs).toEqual([]);
    expect(newNode.inputs).toEqual([]);
    expect(newNode.workspaceId).toBe(ws.id);
    expect(newNode.type).toBe(NumberInputNodeDef.name);

    const node = await getNode(db, newNode.id);

    expect(node).toEqual(newNode);
  });

  test('should not get invalid node', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const unknownNode = await getNode(db, '123');

    expect(unknownNode).toBe(null);
  });

  test('should not create node for unknown workspace', async () => {
    try {
      await createNode(db, NumberInputNodeDef.name, '123', 0, 0);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown workspace!');
    }
  });

  test('should create and delete node', async () => {
    const ws = await createWorkspace(db, 'test', '');

    let nrOfNodes = await getNodesCollection(db).count({});
    expect(nrOfNodes).toBe(0);

    const newNode = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);

    expect(newNode).toBeDefined();

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
      createNode(db, NumberInputNodeDef.name, ws.id, 0, 0),
      createNode(db, StringInputNodeDef.name, ws.id, 0, 0),
      createNode(db, JoinDatasetsNodeDef.name, ws.id, 0, 0)
    ]);

    const allNodes = await getAllNodes(db, ws.id);
    nodes.forEach(n => expect(allNodes).toContainEqual(n));
  });
});
