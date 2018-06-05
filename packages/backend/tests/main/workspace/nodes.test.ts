import {
  ContextNodeType,
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  DataType,
  EditEntriesNodeDef,
  FilterEntriesNodeDef,
  JoinDatasetsNodeDef,
  NodeState,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  SelectValuesNodeDef,
  StringInputNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { select } from 'async';
import { DatasetOutputNode } from '../../../src/main/nodes/dataset';
import {
  createConnection,
  getAllConnections
} from '../../../src/main/workspace/connections';
import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import {
  addOrUpdateFormValue,
  createNode,
  deleteNode,
  getAllNodes,
  getContextInputDefs,
  getContextOutputDefs,
  getMetaInputs,
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
      [],
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
      [],
      0,
      0
    );
    const newNode = await createNode(
      db,
      NumberInputNodeDef.name,
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
    const node = await createNode(db, NumberInputNodeDef.name, ws.id, [], 0, 0);
    await addOrUpdateFormValue(db, node.id, 'value', '1');
    const updatedNode = await getNode(db, node.id);

    const state = await getNodeState(updatedNode);

    expect(state).toBe(NodeState.VALID);
  });

  test('should get invalid node state', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, NumberInputNodeDef.name, ws.id, [], 0, 0);

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
      contextIds: [],
      type: 'unknown',
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      metaInputs: JSON.stringify({}),
      metaOutputs: JSON.stringify({}),
      hasContextFn: false,
      contextInputDefs: '',
      contextOutputDefs: ''
    });

    expect(state).toBe(NodeState.ERROR);
  });

  test('should not create node for unknown workspace', async () => {
    try {
      await createNode(db, NumberInputNodeDef.name, '123', [], 0, 0);
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
    const ws = await createWorkspace(db, 'test', '');

    let nrOfNodes = await getNodesCollection(db).count({});
    expect(nrOfNodes).toBe(0);

    const newNode = await createNode(
      db,
      NumberInputNodeDef.name,
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
      expect(err).toEqual(new Error('Node does not exist'));
    }
  });

  test('should throw error when deleting context type node', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const newRootNode = await createNode(
      db,
      EditEntriesNodeDef.name,
      ws.id,
      [],
      0,
      0
    );
    const allNodes = await getAllNodes(db, ws.id);

    const contextNodes = allNodes.filter(
      n => n.type !== EditEntriesNodeDef.name
    );

    await Promise.all(
      contextNodes.map(async c => {
        try {
          await deleteNode(db, c.id);
          throw NeverGoHereError;
        } catch (err) {
          expect(err).toEqual(
            new Error('Must not delete context nodes separately')
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
      expect(err).toEqual(new Error('Invalid ID'));
    }
  });

  test('should update node and change x and y', async () => {
    const ws = await createWorkspace(db, 'test', '');

    const createdNode = await createNode(
      db,
      NumberInputNodeDef.name,
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
    expect(updatedNode.type).toBe(NumberInputNodeDef.name);
  });

  test('should get all nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const nodes = await Promise.all([
      createNode(db, NumberInputNodeDef.name, ws.id, [], 0, 0),
      createNode(db, StringInputNodeDef.name, ws.id, [], 0, 0),
      createNode(db, JoinDatasetsNodeDef.name, ws.id, [], 0, 0)
    ]);

    const allNodes = await getAllNodes(db, ws.id);
    nodes.forEach(n => expect(allNodes).toContainEqual(n));
  });

  test('should throw error for invalid node type', async () => {
    const ws = await createWorkspace(db, 'test', '');

    try {
      await createNode(db, 'unknown', ws.id, [], 0, 0);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid node type');
    }
  });

  test('should create node and nested context nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const contextNode = await createNode(
      db,
      EditEntriesNodeDef.name,
      ws.id,
      [],
      0,
      0
    );

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
    const ws = await createWorkspace(db, 'test', '');
    const [inputNode, selectNode, outputNode] = await Promise.all([
      createNode(db, DatasetInputNodeDef.name, ws.id, [], 0, 0),
      createNode(db, SelectValuesNodeDef.name, ws.id, [], 0, 0),
      createNode(db, DatasetOutputNodeDef.name, ws.id, [], 0, 0)
    ]);

    await createConnection(
      db,
      { name: 'dataset', nodeId: inputNode.id },
      { name: 'dataset', nodeId: selectNode.id }
    );
    await createConnection(
      db,
      { name: 'dataset', nodeId: selectNode.id },
      { name: 'dataset', nodeId: outputNode.id }
    );

    const res = await deleteNode(db, selectNode.id);
    expect(res).toBe(true);

    const [newInputNode, newOutputNode] = await Promise.all([
      getNode(db, inputNode.id),
      getNode(db, outputNode.id)
    ]);
    expect(newInputNode.outputs.length).toBe(0);
    expect(newOutputNode.inputs.length).toBe(0);
  });

  test('should delete all context nodes and connections', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const contextNode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      [],
      0,
      0
    );
    const nodeA = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      [contextNode.id],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      NumberOutputNodeDef.name,
      ws.id,
      [contextNode.id],
      0,
      0
    );
    await createConnection(
      db,
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id }
    );

    const res = await deleteNode(db, contextNode.id);
    expect(res).toBe(true);

    const allNodes = await getAllNodes(db, ws.id);
    expect(allNodes.length).toBe(0);

    const allConnections = await getAllConnections(db, ws.id);
    expect(allConnections.length).toBe(0);
  });

  test('should delete all nested context nodes and connections', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const contextANode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      [],
      0,
      0
    );
    const contextBNode = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      [contextANode.id],
      0,
      0
    );
    const nodeA = await createNode(
      db,
      NumberInputNodeDef.name,
      ws.id,
      [contextANode.id, contextBNode.id],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      NumberOutputNodeDef.name,
      ws.id,
      [contextANode.id, contextBNode.id],
      0,
      0
    );
    await createConnection(
      db,
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id }
    );

    const res = await deleteNode(db, contextANode.id);
    expect(res).toBe(true);

    const allNodes = await getAllNodes(db, ws.id);
    expect(allNodes.length).toBe(0);

    const allConnections = await getAllConnections(db, ws.id);
    expect(allConnections.length).toBe(0);
  });

  test('should get meta dataset nodes', async () => {
    const ds = await createDataset(db, 't');
    const ws = await createWorkspace(db, 'test', '');
    const dsInputNode = await createNode(
      db,
      DatasetInputNodeDef.name,
      ws.id,
      [],
      0,
      0
    );

    const dsOutputNode = await createNode(
      db,
      DatasetOutputNodeDef.name,
      ws.id,
      [],
      0,
      0
    );

    await addOrUpdateFormValue(
      db,
      dsInputNode.id,
      'dataset',
      JSON.stringify(ds.id)
    );

    await createConnection(
      db,
      { name: 'dataset', nodeId: dsInputNode.id },
      { name: 'dataset', nodeId: dsOutputNode.id }
    );

    const res = await getMetaInputs(db, dsOutputNode.id);

    expect(res.dataset).toBeDefined();
    expect(res.dataset.isPresent).toBe(true);
    expect(res.dataset.content.schema).toEqual([]);
  });

  test('should get null for nodes without contexts', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    const dsInput = await createNode(
      db,
      DatasetInputNodeDef.name,
      ws.id,
      [],
      0,
      0
    );
    const inputRes = await getContextInputDefs(dsInput, db);
    expect(inputRes).toBe(null);

    const outputRes = await getContextOutputDefs(dsInput, db);
    expect(outputRes).toBe(null);
  });

  test('should get empty context inputs', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    const dsInput = await createNode(
      db,
      DatasetInputNodeDef.name,
      ws.id,
      [],
      0,
      0
    );
    const editEntriesNode = await createNode(
      db,
      EditEntriesNodeDef.name,
      ws.id,
      [],
      0,
      0
    );

    const allNodes = await getAllNodes(db, ws.id);
    const contextInputNode = allNodes.find(
      n => n.type === ContextNodeType.INPUT
    );
    const contextOutputNode = allNodes.find(
      n => n.type === ContextNodeType.OUTPUT
    );
    expect(contextInputNode).toBeDefined();
    expect(contextOutputNode).toBeDefined();

    const inputRes = await getContextInputDefs(contextInputNode, db);
    expect(inputRes).toEqual({});
    const outputRes = await getContextOutputDefs(contextInputNode, db);
    expect(outputRes).toEqual({});
  });

  test('should get context inputs with dataset schema', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    const ds = await createDataset(db, 'DsA');
    const valA = {
      name: 'testA',
      type: DataType.BOOLEAN,
      required: true,
      fallback: 'true',
      unique: false
    };
    const valB = {
      name: 'testB',
      type: DataType.STRING,
      required: true,
      fallback: 'true',
      unique: false
    };

    await Promise.all([
      addValueSchema(db, ds.id, valA),
      addValueSchema(db, ds.id, valB)
    ]);

    const [dsInput, filterEntries] = await Promise.all([
      createNode(db, DatasetInputNodeDef.name, ws.id, [], 0, 0),
      createNode(db, FilterEntriesNodeDef.name, ws.id, [], 0, 0)
    ]);

    await addOrUpdateFormValue(
      db,
      dsInput.id,
      'dataset',
      JSON.stringify(ds.id)
    );

    await createConnection(
      db,
      { name: 'dataset', nodeId: dsInput.id },
      { name: 'dataset', nodeId: filterEntries.id }
    );

    const allNodes = await getAllNodes(db, ws.id);
    const contextInputNode = allNodes.find(
      n => n.type === ContextNodeType.INPUT
    );
    const contextOutputNode = allNodes.find(
      n => n.type === ContextNodeType.OUTPUT
    );
    expect(contextInputNode).toBeDefined();
    expect(contextOutputNode).toBeDefined();

    const inputRes = await getContextInputDefs(contextInputNode, db);
    expect(inputRes).toEqual({
      [valA.name]: {
        dataType: valA.type,
        displayName: valA.name,
        isDynamic: true
      },
      [valB.name]: {
        dataType: valB.type,
        displayName: valB.name,
        isDynamic: true
      }
    });
    const outputRes = await getContextOutputDefs(contextInputNode, db);
    expect(outputRes).toEqual({
      keepEntry: {
        dataType: DataType.BOOLEAN,
        displayName: 'Keep entry'
      }
    });
  });
});
