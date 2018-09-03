import {
  ContextNodeType,
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  EditEntriesNodeDef,
  JoinDatasetsNodeDef,
  NodeState,
  NumberInputNodeDef,
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
  tryGetContextNode,
  tryGetNode,
  updateNodePosition
} from '../../../src/main/workspace/nodes';
import { addOrUpdateFormValue } from '../../../src/main/workspace/nodes-detail';
import { updateStates } from '../../../src/main/workspace/nodes-state';
import { getWorkspace } from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  NODE,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/workspace/workspace');
jest.mock('../../../src/main/workspace/connections');
jest.mock('../../../src/main/workspace/nodes-state');

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
    db = undefined;
    conn = undefined;
    server = undefined;
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);
    (updateStates as jest.Mock).mockResolvedValue({});

    const newNode = await createNode(NumberInputNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });

    expect(newNode.id).toBeDefined();
    expect(newNode.outputs).toEqual([]);
    expect(newNode.inputs).toEqual([]);
    expect(newNode.workspaceId).toBe(ws.id);
    expect(newNode.type).toBe(NumberInputNodeDef.type);

    await addOrUpdateFormValue(newNode.id, 'test', JSON.stringify('abc'), {
      db,
      userId: ''
    });

    const node = await getNode(newNode.id, {
      db,
      userId: ''
    });

    expect(node).toEqual({
      ...newNode,
      ...{ form: [{ name: 'test', value: '"abc"' }] }
    });
  });

  test('should create and get node in context', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextNode = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    const newNode = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0,
      {
        db,
        userId: ''
      }
    );

    expect(newNode.id).toBeDefined();
    expect(newNode.outputs).toEqual([]);
    expect(newNode.inputs).toEqual([]);
    expect(newNode.workspaceId).toBe(ws.id);
    expect(newNode.contextIds[0]).toBe(contextNode.id);
    expect(newNode.type).toBe(NumberInputNodeDef.type);

    const node = await getNode(newNode.id, {
      db,
      userId: ''
    });

    expect(node).toEqual(newNode);
  });

  test('should not get invalid node', async () => {
    const unknownNode = await getNode('123', {
      db,
      userId: ''
    });

    expect(unknownNode).toBe(null);
  });

  test('should try to get node', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);
    const reqContext = { db, userId: '123' };

    const node = await createNode(
      StringInputNodeDef.type,
      ws.id,
      [],
      0,
      0,
      reqContext
    );
    const res = await tryGetNode(node.id, reqContext);
    expect(res.id).toBe(node.id);
  });

  test('should throw error for unknown node', async () => {
    try {
      await tryGetNode(VALID_OBJECT_ID, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Node not found');
    }
  });

  test('should not create node for unknown workspace', async () => {
    try {
      await createNode(NumberInputNodeDef.type, '123', [], 0, 0, {
        db,
        userId: ''
      });
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    try {
      await createNode(
        NumberInputNodeDef.type,
        ws.id,
        [VALID_OBJECT_ID],
        0,
        0,
        {
          db,
          userId: ''
        }
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    let nrOfNodes = await getNodesCollection(db).countDocuments();
    expect(nrOfNodes).toBe(0);

    const newNode = await createNode(NumberInputNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });

    expect(newNode).not.toBe(null);

    nrOfNodes = await getNodesCollection(db).countDocuments();
    expect(nrOfNodes).toBe(1);

    const res = await deleteNode(newNode.id, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    nrOfNodes = await getNodesCollection(db).countDocuments();
    expect(nrOfNodes).toBe(0);
  });

  test('should throw error when deleting node with unknown id', async () => {
    try {
      await deleteNode(VALID_OBJECT_ID, {
        db,
        userId: ''
      });
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    await createNode(EditEntriesNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });
    const allNodes = await getAllNodes(ws.id, {
      db,
      userId: ''
    });
    expect(allNodes.length).toBe(3);

    const contextNodes = allNodes.filter(
      n => n.type !== EditEntriesNodeDef.type
    );

    await Promise.all(
      contextNodes.map(async c => {
        try {
          await deleteNode(c.id, {
            db,
            userId: ''
          });
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
      await deleteNode('abc', {
        db,
        userId: ''
      });
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const createdNode = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0,
      {
        db,
        userId: ''
      }
    );

    const newPos = [123, 456];
    const res = await updateNodePosition(createdNode.id, newPos[0], newPos[1], {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const updatedNode = await getNode(createdNode.id, {
      db,
      userId: ''
    });

    expect(updatedNode.x).toBe(newPos[0]);
    expect(updatedNode.y).toBe(newPos[1]);
    expect(updatedNode.workspaceId).toBe(ws.id);
    expect(updatedNode.type).toBe(NumberInputNodeDef.type);
  });

  test('should throw error for invalid ID in updateNodePosition', async () => {
    try {
      await updateNodePosition('test', 0, 0, {
        db,
        userId: ''
      });
    } catch (err) {
      expect(err.message).toBe('Invalid ID');
    }
  });

  test('should get all nodes', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);
    (updateStates as jest.Mock).mockResolvedValue({});

    const [nodeA, nodeB, nodeC] = await Promise.all([
      createNode(NumberInputNodeDef.type, ws.id, [], 0, 0, {
        db,
        userId: ''
      }),
      createNode(StringInputNodeDef.type, ws.id, [], 0, 0, {
        db,
        userId: ''
      }),
      createNode(JoinDatasetsNodeDef.type, ws.id, [], 0, 0, {
        db,
        userId: ''
      })
    ]);
    await addOrUpdateFormValue(nodeA.id, 'test', 'a', {
      db,
      userId: ''
    });

    const allNodes = await getAllNodes(ws.id, {
      db,
      userId: ''
    });
    expect(allNodes).toContainEqual({
      contextIds: [],
      form: [{ name: 'test', value: 'a' }],
      id: nodeA.id,
      state: NodeState.VALID,
      inputs: [],
      outputs: [],
      type: 'NumberInput',
      workspaceId: '5b07b3129ba658500b75a29a',
      variables: {},
      x: 0,
      y: 0
    });
    expect(allNodes).toContainEqual(nodeB);
    expect(allNodes).toContainEqual(nodeC);
  });

  test('should throw error for invalid node type', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    try {
      await createNode('UnknownNodeType', ws.id, [], 0, 0, {
        db,
        userId: ''
      });
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextNode = await createNode(
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0,
      {
        db,
        userId: ''
      }
    );

    try {
      await createNode(
        StringOutputNodeDef.type,
        ws.id,
        [contextNode.id],
        0,
        0,
        {
          db,
          userId: ''
        }
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);
    (updateStates as jest.Mock).mockResolvedValue({});

    await createNode(EditEntriesNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });

    const allNodes = await getAllNodes(ws.id, {
      db,
      userId: ''
    });
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);
    (createConnection as jest.Mock).mockImplementation(
      async (from, to, context) => {
        const nodesCollection = getNodesCollection(context.db);
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
      createNode(DatasetInputNodeDef.type, ws.id, [], 0, 0, {
        db,
        userId: ''
      }),
      createNode(EditEntriesNodeDef.type, ws.id, [], 0, 0, {
        db,
        userId: ''
      }),
      createNode(DatasetOutputNodeDef.type, ws.id, [], 0, 0, {
        db,
        userId: ''
      })
    ]);

    await createConnection(
      { name: 'dataset', nodeId: inputNode.id },
      { name: 'dataset', nodeId: selectNode.id },
      {
        db,
        userId: ''
      }
    );
    await createConnection(
      { name: 'dataset', nodeId: selectNode.id },
      { name: 'dataset', nodeId: outputNode.id },
      {
        db,
        userId: ''
      }
    );

    const res = await deleteNode(selectNode.id, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const [newInputNode, newOutputNode] = await Promise.all([
      getNode(inputNode.id, {
        db,
        userId: ''
      }),
      getNode(outputNode.id, {
        db,
        userId: ''
      })
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
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextNode = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    const nodeA = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    const nodeB = await createNode(
      SumNodeDef.type,
      ws.id,
      [contextNode.id],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    await createConnection(
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id },
      {
        db,
        userId: ''
      }
    );

    const res = await deleteNode(contextNode.id, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const allNodes = await getAllNodes(ws.id, {
      db,
      userId: ''
    });
    expect(allNodes.length).toBe(0);

    expect(deleteConnectionsInContext).toHaveBeenCalledTimes(1);
  });

  test('should delete all nested context nodes and connections', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const contextANode = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    const contextBNode = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [contextANode.id],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    const nodeA = await createNode(
      NumberInputNodeDef.type,
      ws.id,
      [contextANode.id, contextBNode.id],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    const nodeB = await createNode(
      SumNodeDef.type,
      ws.id,
      [contextANode.id, contextBNode.id],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    await createConnection(
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id },
      {
        db,
        userId: ''
      }
    );

    const res = await deleteNode(contextANode.id, {
      db,
      userId: ''
    });
    expect(res).toBe(true);

    const allNodes = await getAllNodes(ws.id, {
      db,
      userId: ''
    });
    expect(allNodes.length).toBe(0);

    expect(deleteConnectionsInContext).toHaveBeenCalledTimes(1);
  });

  test('should get context node', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const eeNode = await createNode(
      EditEntriesNodeDef.type,
      VALID_OBJECT_ID,
      [],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    let res = await getContextNode(eeNode, ContextNodeType.INPUT, {
      db,
      userId: ''
    });
    expect(res.type).toBe(ContextNodeType.INPUT);

    res = await getContextNode(eeNode, ContextNodeType.OUTPUT, {
      db,
      userId: ''
    });
    expect(res.type).toBe(ContextNodeType.OUTPUT);
  });

  test('should return null for node without context', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const node = await createNode(
      StringInputNodeDef.type,
      VALID_OBJECT_ID,
      [],
      0,
      0,
      {
        db,
        userId: ''
      }
    );
    const res = await getContextNode(node, ContextNodeType.INPUT, {
      db,
      userId: ''
    });
    expect(res).toBe(null);
  });

  test('should try to get context node', async () => {
    const ws: Workspace = {
      id: VALID_OBJECT_ID,
      name: 'ws',
      description: '',
      created: '',
      lastChange: ''
    };
    (getWorkspace as jest.Mock).mockResolvedValue(ws);

    const reqContext = { db, userId: '123' };
    const node = await createNode(
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0,
      reqContext
    );
    const res = await tryGetContextNode(
      node,
      ContextNodeType.INPUT,
      reqContext
    );
    expect(res.id).toBeDefined();
  });

  test('should throw error for unknown context node', async () => {
    try {
      await tryGetContextNode(NODE, ContextNodeType.INPUT, {
        db,
        userId: '123'
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown context node');
    }
  });
});
