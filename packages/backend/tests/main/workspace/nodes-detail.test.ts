import {
  ContextNodeType,
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  DataType,
  EditEntriesNodeDef,
  FilterEntriesNodeDef,
  NodeState,
  NumberInputNodeDef,
  StringInputNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { createConnection } from '../../../src/main/workspace/connections';
import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import {
  createNode,
  getAllNodes,
  getNode
} from '../../../src/main/workspace/nodes';
import {
  addOrUpdateFormValue,
  getContextInputDefs,
  getContextNode,
  getContextOutputDefs,
  getInputDefs,
  getMetaInputs,
  getMetaOutputs,
  getNodeState
} from '../../../src/main/workspace/nodes-detail';
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

  test('should get valid node state', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, NumberInputNodeDef.type, ws.id, [], 0, 0);
    await addOrUpdateFormValue(db, node.id, 'value', '1');
    const updatedNode = await getNode(db, node.id);

    const state = await getNodeState(updatedNode, db);

    expect(state).toBe(NodeState.VALID);
  });

  test('should get invalid node state', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, NumberInputNodeDef.type, ws.id, [], 0, 0);

    const state = await getNodeState(node, db);

    expect(state).toBe(NodeState.INVALID);
  });

  test('should get error node state', async () => {
    const state = await getNodeState(
      {
        id: VALID_OBJECT_ID,
        form: [],
        inputs: [],
        outputs: [],
        contextIds: [],
        type: 'unknown',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      db
    );

    expect(state).toBe(NodeState.ERROR);
  });

  test('should get error node state', async () => {
    const state = await getNodeState(
      {
        id: VALID_OBJECT_ID,
        form: [],
        inputs: [],
        outputs: [],
        contextIds: [],
        type: 'unknown',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      db
    );

    expect(state).toBe(NodeState.ERROR);
  });

  test('should get meta dataset nodes', async () => {
    const ds = await createDataset(db, 't');
    const ws = await createWorkspace(db, 'test', '');
    const dsInputNode = await createNode(
      db,
      DatasetInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const dsOutputNode = await createNode(
      db,
      DatasetOutputNodeDef.type,
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

    const node = await getNode(db, dsOutputNode.id);
    const res = await getMetaInputs(node, db);

    expect(res.dataset).toBeDefined();
    expect(res.dataset.isPresent).toBe(true);
    expect(res.dataset.content.schema).toEqual([]);
  });

  test('should get null for nodes without contexts', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    const dsInput = await createNode(
      db,
      DatasetInputNodeDef.type,
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

  test('should throw error for missing parent node', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    try {
      await getContextInputDefs(
        {
          type: ContextNodeType.INPUT,
          contextIds: [VALID_OBJECT_ID],
          inputs: [],
          outputs: [],
          form: [],
          x: 0,
          y: 0,
          workspaceId: ws.id,
          id: VALID_OBJECT_ID
        },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Parent node missing');
    }
  });

  test('should return null for non context node as parent (should never happen)', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    const wrongParentNode = await createNode(
      db,
      StringInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const res = await getContextInputDefs(
      {
        type: ContextNodeType.INPUT,
        contextIds: [wrongParentNode.id],
        inputs: [],
        outputs: [],
        form: [],
        x: 0,
        y: 0,
        workspaceId: ws.id,
        id: VALID_OBJECT_ID
      },
      db
    );

    expect(res).toBe(null);
  });

  test('should throw error for missing parent node', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    try {
      await getContextOutputDefs(
        {
          type: ContextNodeType.INPUT,
          contextIds: [VALID_OBJECT_ID],
          inputs: [],
          outputs: [],
          form: [],
          x: 0,
          y: 0,
          workspaceId: ws.id,
          id: VALID_OBJECT_ID
        },
        db
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Parent node missing');
    }
  });

  test('should get empty context inputs', async () => {
    const ws = await createWorkspace(db, 'Ws', '');
    const dsInput = await createNode(
      db,
      DatasetInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const editEntriesNode = await createNode(
      db,
      EditEntriesNodeDef.type,
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

  test('should throw error for empty value names', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0);
    try {
      await addOrUpdateFormValue(db, node.id, '', 'test');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('No form value name specified');
    }
  });

  test('should throw error for invalid node id', async () => {
    try {
      await addOrUpdateFormValue(db, VALID_OBJECT_ID, 'test', 'test');
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Node does not exist');
    }
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
      createNode(db, DatasetInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, FilterEntriesNodeDef.type, ws.id, [], 0, 0)
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

  test('should get input defs from EditEntriesNode', async () => {
    const inputDefs = await getInputDefs(
      {
        type: EditEntriesNodeDef.type,
        inputs: [],
        outputs: [],
        form: [],
        x: 0,
        y: 0,
        contextIds: [],
        workspaceId: VALID_OBJECT_ID,
        id: VALID_OBJECT_ID
      },
      db
    );
    expect(inputDefs).toEqual({
      dataset: { dataType: DataType.DATASET, displayName: 'Dataset' }
    });
  });

  test('should get input defs from ContextInputNode', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const dsNode = await createNode(
      db,
      DatasetInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const eeNode = await createNode(
      db,
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    await createConnection(
      db,
      { name: 'dataset', nodeId: dsNode.id },
      { name: 'dataset', nodeId: eeNode.id }
    );

    const ds = await createDataset(db, 'test');
    await addOrUpdateFormValue(db, dsNode.id, 'dataset', JSON.stringify(ds.id));
    await addValueSchema(db, ds.id, {
      name: 'dataset',
      type: DataType.STRING,
      unique: false,
      required: true,
      fallback: ''
    });

    const contextInputNode = await getContextNode(
      eeNode,
      ContextNodeType.INPUT,
      db
    );
    let inputDefs = await getInputDefs(contextInputNode, db);
    expect(inputDefs).toEqual({
      dataset: {
        dataType: DataType.STRING,
        displayName: 'dataset',
        isDynamic: true
      }
    });

    const contextOutputNode = await getContextNode(
      eeNode,
      ContextNodeType.OUTPUT,
      db
    );
    inputDefs = await getInputDefs(contextOutputNode, db);
    expect(inputDefs).toEqual({
      dataset: {
        dataType: DataType.STRING,
        displayName: 'dataset',
        isDynamic: true
      }
    });
  });

  test('should get context nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const dsNode = await createNode(
      db,
      DatasetInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const eeNode = await createNode(
      db,
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const contextInputNode = await getContextNode(
      eeNode,
      ContextNodeType.INPUT,
      db
    );
    expect(contextInputNode.type).toBe(ContextNodeType.INPUT);
    expect(contextInputNode.contextIds).toEqual([eeNode.id]);

    const contextOutputNode = await getContextNode(
      eeNode,
      ContextNodeType.OUTPUT,
      db
    );
    expect(contextOutputNode.type).toBe(ContextNodeType.OUTPUT);
    expect(contextOutputNode.contextIds).toEqual([eeNode.id]);
  });

  test('should return for node without context', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const strInputNode = await createNode(
      db,
      StringInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const res = await getContextNode(strInputNode, ContextNodeType.INPUT, db);
    expect(res).toBe(null);
  });

  test('should get empty meta inputs for context', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0);
    const res = await getMetaInputs(node, db);
    expect(res).toEqual({});
  });

  test('should get empty meta outputs for context', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0);
    const res = await getMetaOutputs(db, node.id);
    expect(res).toEqual({ value: { content: {}, isPresent: false } });
  });
});
