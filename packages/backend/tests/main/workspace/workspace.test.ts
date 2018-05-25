import { MongoClient, Db } from 'mongodb';
import {
  ProcessState,
  NodeInstance,
  NodeState,
  NumberOutputNodeDef,
  NumberInputNodeDef,
  DatasetOutputNodeDef,
  IOValues,
  Workspace,
  JoinDatasetsNodeDef,
  StringInputNodeDef
} from '@masterthesis/shared';

import {
  createNode,
  deleteNode,
  getNodesCollection,
  updateNode,
  getNode,
  getAllNodes
} from '../../../src/main/workspace/nodes';
import {
  getWorkspace,
  getWorkspacesCollection,
  createWorkspace
} from '../../../src/main/workspace/workspace';
import { all } from 'async';

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
});
