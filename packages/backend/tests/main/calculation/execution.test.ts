import {
  ContextNodeType,
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  DataType,
  EditEntriesNodeDef,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  StringInputNodeDef,
  StringOutputNodeDef,
  SumNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  executeNode,
  executeNodeWithId
} from '../../../src/main/calculation/execution';
import { createConnection } from '../../../src/main/workspace/connections';
import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { createEntry, getAllEntries } from '../../../src/main/workspace/entry';
import {
  createNode,
  getContextNode,
  getNode,
  getNodesCollection
} from '../../../src/main/workspace/nodes';
import { addOrUpdateFormValue } from '../../../src/main/workspace/nodes-detail';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

describe('Execution', () => {
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

  test('should execute simple node', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0);

    await addOrUpdateFormValue(db, node.id, 'value', JSON.stringify('test'));

    const { outputs, results } = await executeNodeWithId(db, node.id);

    expect(outputs).toBeDefined();
    expect(results).toBeUndefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('should execute connected nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const nodeA = await createNode(
      db,
      StringInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const nodeB = await createNode(
      db,
      StringOutputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    await createConnection(
      db,
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id }
    );
    await addOrUpdateFormValue(db, nodeA.id, 'value', JSON.stringify('test'));

    const { outputs, results } = await executeNodeWithId(db, nodeB.id);

    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect(Object.keys(outputs).length).toBe(0);
    expect(Object.keys(results!).length).toBe(1);
  });

  test('should return outputs from context for context input nodes', async () => {
    const contextInputs = { test: 123 };
    const res = await executeNode(
      db,
      {
        type: ContextNodeType.INPUT,
        x: 0,
        y: 0,
        workspaceId: VALID_OBJECT_ID,
        id: VALID_OBJECT_ID,
        outputs: [],
        inputs: [],
        form: [],
        contextIds: [VALID_OBJECT_ID]
      },
      contextInputs
    );
    expect(res).toEqual({ outputs: contextInputs });
  });

  test('should throw error for unknown node type', async () => {
    try {
      await executeNode(db, {
        type: 'UnknownNodeType',
        x: 0,
        y: 0,
        workspaceId: VALID_OBJECT_ID,
        id: VALID_OBJECT_ID,
        outputs: [],
        inputs: [],
        form: [],
        contextIds: [VALID_OBJECT_ID]
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node type: UnknownNodeType');
    }
  });

  test('should fail for invalid form', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, NumberInputNodeDef.type, ws.id, [], 0, 0);
    await addOrUpdateFormValue(db, node.id, 'value', '{NaN');

    try {
      await executeNode(db, node);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Form values or inputs are missing');
    }
  });

  test('should fail for invalid input', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const [nodeA, nodeB] = await Promise.all([
      createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, NumberOutputNodeDef.type, ws.id, [], 0, 0)
    ]);
    await addOrUpdateFormValue(db, nodeA.id, 'value', 'NaN');
    await createConnection(
      db,
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id }
    );

    try {
      await executeNode(db, nodeB);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Form values or inputs are missing');
    }
  });

  test('should wait for inputs and combine them as sum', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const [nodeA, nodeB] = await Promise.all([
      createNode(db, NumberInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, NumberInputNodeDef.type, ws.id, [], 0, 0)
    ]);
    const sumNode = await createNode(db, SumNodeDef.type, ws.id, [], 0, 0);
    const outputNode = await createNode(
      db,
      NumberOutputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    await addOrUpdateFormValue(db, nodeA.id, 'value', '18');
    await addOrUpdateFormValue(db, nodeB.id, 'value', '81');

    await createConnection(
      db,
      { name: 'value', nodeId: nodeA.id },
      { name: 'a', nodeId: sumNode.id }
    );
    await createConnection(
      db,
      { name: 'value', nodeId: nodeB.id },
      { name: 'b', nodeId: sumNode.id }
    );
    await createConnection(
      db,
      { name: 'sum', nodeId: sumNode.id },
      { name: 'value', nodeId: outputNode.id }
    );

    const updatedNode = await getNode(db, outputNode.id);
    const { outputs, results } = await executeNode(db, updatedNode);

    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect((results as any).value).toBe(99);
  });

  test('should support context functions', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const ds = await createDataset(db, 'test');
    await addValueSchema(db, ds.id, {
      name: 'val',
      type: DataType.STRING,
      unique: true,
      required: true,
      fallback: ''
    });
    await createEntry(db, ds.id, { val: JSON.stringify('test') });

    const [editEntriesNode, inputNode, outputNode] = await Promise.all(
      [
        EditEntriesNodeDef.type,
        DatasetInputNodeDef.type,
        DatasetOutputNodeDef.type
      ].map(type => createNode(db, type, ws.id, [], 0, 0))
    );

    const nodesColl = await getNodesCollection(db);
    const contextOutputNode = await getContextNode(
      editEntriesNode,
      ContextNodeType.OUTPUT,
      db
    );
    expect(contextOutputNode).toBeDefined();
    const stringInputNode = await createNode(
      db,
      StringInputNodeDef.type,
      ws.id,
      [editEntriesNode.id],
      0,
      0
    );
    await createConnection(
      db,
      { name: 'value', nodeId: stringInputNode.id },
      { name: 'val', nodeId: contextOutputNode!.id }
    );

    await addOrUpdateFormValue(
      db,
      inputNode.id,
      'dataset',
      JSON.stringify(ds.id)
    );
    await addOrUpdateFormValue(
      db,
      stringInputNode.id,
      'value',
      JSON.stringify('test')
    );

    await Promise.all(
      [
        { from: inputNode.id, to: editEntriesNode.id },
        { from: editEntriesNode.id, to: outputNode.id }
      ].map(pair =>
        createConnection(
          db,
          { name: 'dataset', nodeId: pair.from },
          { name: 'dataset', nodeId: pair.to }
        )
      )
    );

    const updatedNode = await getNode(db, outputNode.id);
    const { outputs, results } = await executeNode(db, updatedNode);

    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect((results as any).dataset).toBeDefined();

    const newDsId = (results as any).dataset.datasetId;
    const allEntries = await getAllEntries(db, newDsId);
    expect(allEntries.length).toBe(1);
  });

  test('should throw error', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const ds = await createDataset(db, 'test');

    const editEntriesNode = await createNode(
      db,
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const nodesColl = await getNodesCollection(db);
    const inputNode = await getContextNode(
      editEntriesNode,
      ContextNodeType.INPUT,
      db
    );

    try {
      const { outputs, results } = await executeNode(db, inputNode);
    } catch (err) {
      expect(err.message).toBe('Context needs context inputs');
    }
  });
});
