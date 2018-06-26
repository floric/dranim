import {
  ContextNodeType,
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  EditEntriesNodeDef,
  JoinDatasetsNodeDef,
  NumberInputNodeDef,
  SelectValuesNodeDef,
  StringInputNodeDef,
  StringOutputNodeDef,
  SumNodeDef,
  Workspace
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import {
  createConnection,
  deleteConnection,
  deleteConnectionsInContext
} from '../../../src/main/workspace/connections';
import {
  createNode,
  deleteNode,
  getAllNodes,
  getContextNode,
  getNode,
  getNodesCollection,
  tryGetNode,
  updateNode
} from '../../../src/main/workspace/nodes';
import { getWorkspace } from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/workspace/workspace');
jest.mock('../../../src/main/workspace/connections');

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
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const newNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    expect(newNode.id).toBeDefined();
    expect(newNode.outputs).toEqual([]);
    expect(newNode.inputs).toEqual([]);
    expect(newNode.workspaceId).toBe(ws.id);
    expect(newNode.type).toBe(NumberInputNodeDef.type);

    const node = await getNode(db, newNode.id);

    expect(node).toEqual(newNode);
  });

  test('should create and get node in context', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const newNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0
    );

    expect(newNode.id).toBeDefined();
    expect(newNode.outputs).toEqual([]);
    expect(newNode.inputs).toEqual([]);
    expect(newNode.workspaceId).toBe(ws.id);
    expect(newNode.contextIds[0]).toBe(contextNode.id);
    expect(newNode.type).toBe(NumberInputNodeDef.type);

    const node = await getNode(db, newNode.id);

    expect(node).toEqual(newNode);
  });

  test('should not get invalid node', async () => {
    const unknownNode = await getNode(db, '123');

    expect(unknownNode).toBe(null);
  });

  test('should throw error for unknown node', async () => {
    try {
      await tryGetNode(VALID_OBJECT_ID, db);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Node not found');
    }
  });

  test('should not create node for unknown workspace', async () => {
    try {
      await createNode(db, NumberInputNodeDef.type, '123', [], 0, 0);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown workspace');
    }
  });

  test('should not create node for unknown context node', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    try {
      await createNode(
        db,
        NumberInputNodeDef.type,
        ws.id,
        [VALID_OBJECT_ID],
        0,
        0
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown context node');
    }
  });

  test('should create and delete node', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    let nrOfNodes = await getNodesCollection(db).count({});
    expect(nrOfNodes).toBe(0);

    const newNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
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

  test('should throw error when deleting node with unknown id', async () => {
    try {
      await deleteNode(db, VALID_OBJECT_ID);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Node not found');
    }
  });

  test('should throw error when deleting context type node', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    await createNode(db, EditEntriesNodeDef.type, ws.id, [], 0, 0);
    const allNodes = await getAllNodes(db, ws.id);
    expect(allNodes.length).toBe(3);

    const contextNodes = allNodes.filter(
      n => n.type !== EditEntriesNodeDef.type
    );

    await Promise.all(
      contextNodes.map(async c => {
        try {
          await deleteNode(db, c.id);
          throw NeverGoHereError;
        } catch (err) {
          expect(err.message).toEqual(
            'Must not delete context nodes separately'
          );
        }
      })
    );
  });

  test('should not delete unknown node', async () => {
    try {
      await deleteNode(db, 'abc');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toEqual('Node not found');
    }
  });

  test('should update node and change x and y', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const createdNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
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
    expect(updatedNode.type).toBe(NumberInputNodeDef.type);
  });

  test('should throw error for invalid ID in updateNode', async () => {
    try {
      await updateNode(db, 'test', 0, 0);
    } catch (err) {
      expect(err.message).toBe('Invalid ID');
    }
  });

  test('should get all nodes', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const nodes = await Promise.all([
      createNode(db, NumberInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, JoinDatasetsNodeDef.type, ws.id, [], 0, 0)
    ]);

    const allNodes = await getAllNodes(db, ws.id);
    nodes.forEach(n => expect(allNodes).toContainEqual(n));
  });

  test('should throw error for invalid node type', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    try {
      await createNode(db, 'UnknownNodeType', ws.id, [], 0, 0);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node type: UnknownNodeType');
    }
  });

  test('should throw error for output node in context', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextNode = await createNode(
      db,
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    try {
      await createNode(
        db,
        StringOutputNodeDef.type,
        ws.id,
        [contextNode.id],
        0,
        0
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Output nodes only on root level allowed');
    }
  });

  test('should create node and nested context nodes', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    await createNode(db, EditEntriesNodeDef.type, ws.id, [], 0, 0);

    const allNodes = await getAllNodes(db, ws.id);
    expect(allNodes.length).toBe(3);

    const rootNodes = allNodes.filter(n => n.contextIds.length === 0);
    expect(rootNodes.length).toBe(1);

    const contextNodes = allNodes.filter(n => n.contextIds.length === 1);
    expect(contextNodes.length).toBe(2);
    expect(
      contextNodes.find(n => n.type === ContextNodeType.OUTPUT).contextIds
    ).toEqual([rootNodes[0].id]);
    expect(
      contextNodes.find(n => n.type === ContextNodeType.INPUT).contextIds
    ).toEqual([rootNodes[0].id]);
  });

  test('should delete connection infos on nodes', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);
    (createConnection as jest.Mock).mockImplementation(
      async (from, to, passedDb) => {
        const nodesCollection = getNodesCollection(passedDb);
        await nodesCollection.updateOne(
          { _id: new ObjectID(from.nodeId) },
          {
            $push: {
              inputs: {
                name: from.name,
                connectionId: 'conn'
              }
            }
          }
        );
        await nodesCollection.updateOne(
          { _id: new ObjectID(to.nodeId) },
          {
            $push: {
              outputs: {
                name: to.name,
                connectionId: 'conn'
              }
            }
          }
        );
      }
    );

    const [inputNode, selectNode, outputNode] = await Promise.all([
      createNode(db, DatasetInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, SelectValuesNodeDef.type, ws.id, [], 0, 0),
      createNode(db, DatasetOutputNodeDef.type, ws.id, [], 0, 0)
    ]);

    await createConnection(
      { name: 'dataset', nodeId: inputNode.id },
      { name: 'dataset', nodeId: selectNode.id },
      db
    );
    await createConnection(
      { name: 'dataset', nodeId: selectNode.id },
      { name: 'dataset', nodeId: outputNode.id },
      db
    );

    const res = await deleteNode(db, selectNode.id);
    expect(res).toBe(true);

    const [newInputNode, newOutputNode] = await Promise.all([
      getNode(db, inputNode.id),
      getNode(db, outputNode.id)
    ]);
    expect(newInputNode.outputs.length).toBe(0);
    expect(newOutputNode.inputs.length).toBe(0);

    expect(deleteConnection).toHaveBeenCalledTimes(2);
  });

  test('should delete all context nodes and connections', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      SumNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0
    );
    await createConnection(
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id },
      db
    );

    const res = await deleteNode(db, contextNode.id);
    expect(res).toBe(true);

    const allNodes = await getAllNodes(db, ws.id);
    expect(allNodes.length).toBe(0);

    expect(deleteConnectionsInContext).toHaveBeenCalledTimes(1);
  });

  test('should delete all nested context nodes and connections', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextANode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const contextBNode = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [contextANode.id],
      0,
      0
    );
    const nodeA = await createNode(
      db,
      NumberInputNodeDef.type,
      ws.id,
      [contextANode.id, contextBNode.id],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      SumNodeDef.type,
      ws.id,
      [contextANode.id, contextBNode.id],
      0,
      0
    );
    await createConnection(
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id },
      db
    );

    const res = await deleteNode(db, contextANode.id);
    expect(res).toBe(true);

    const allNodes = await getAllNodes(db, ws.id);
    expect(allNodes.length).toBe(0);

    expect(deleteConnectionsInContext).toHaveBeenCalledTimes(1);
  });

  test('should get context node', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const eeNode = await createNode(
      db,
      EditEntriesNodeDef.type,
      VALID_OBJECT_ID,
      [],
      0,
      0
    );
    let res = await getContextNode(eeNode, ContextNodeType.INPUT, db);
    expect(res.type).toBe(ContextNodeType.INPUT);

    res = await getContextNode(eeNode, ContextNodeType.OUTPUT, db);
    expect(res.type).toBe(ContextNodeType.OUTPUT);
  });

  test('should return null for node without context', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      nodes: [],
      connections: [],
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const node = await createNode(
      db,
      StringInputNodeDef.type,
      VALID_OBJECT_ID,
      [],
      0,
      0
    );
    const res = await getContextNode(node, ContextNodeType.INPUT, db);
    expect(res).toBe(null);
  });
});
