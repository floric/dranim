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
  getNode
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
    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const node = await createNode(StringInputNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });

    await addOrUpdateFormValue(node.id, 'value', JSON.stringify('test'), {
      db,
      userId: ''
    });

    const { outputs, results } = await executeNodeWithId(node.id, {
      db,
      userId: ''
    });

    expect(outputs).toBeDefined();
    expect(results).toBeUndefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('should execute connected nodes', async () => {
    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const nodeA = await createNode(StringInputNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });
    const nodeB = await createNode(StringOutputNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });
    await createConnection(
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id },
      { db, userId: '' }
    );
    await addOrUpdateFormValue(nodeA.id, 'value', JSON.stringify('test'), {
      db,
      userId: ''
    });
    await addOrUpdateFormValue(nodeB.id, 'name', JSON.stringify('test'), {
      db,
      userId: ''
    });
    const { outputs, results } = await executeNodeWithId(nodeB.id, {
      db,
      userId: ''
    });

    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect(Object.keys(outputs).length).toBe(0);
    expect((results as any).value).toBe('test');
  });

  test('should return outputs from context for context input nodes', async () => {
    const contextInputs = { test: 123 };
    const res = await executeNode(
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
      { db, userId: '' },
      contextInputs
    );
    expect(res).toEqual({ outputs: contextInputs });
  });

  test('should throw error for unknown node type', async () => {
    try {
      await executeNode(
        {
          type: 'UnknownNodeType',
          x: 0,
          y: 0,
          workspaceId: VALID_OBJECT_ID,
          id: VALID_OBJECT_ID,
          outputs: [],
          inputs: [],
          form: [],
          contextIds: [VALID_OBJECT_ID]
        },
        { db, userId: '' }
      );
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Unknown node type: UnknownNodeType');
    }
  });

  test('should fail for invalid form', async () => {
    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const node = await createNode(NumberInputNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });
    await addOrUpdateFormValue(node.id, 'value', '{NaN', { db, userId: '' });

    try {
      await executeNode(node, { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Form values or inputs are missing');
    }
  });

  test('should fail for invalid input', async () => {
    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const [nodeA, nodeB] = await Promise.all([
      createNode(StringInputNodeDef.type, ws.id, [], 0, 0, { db, userId: '' }),
      createNode(NumberOutputNodeDef.type, ws.id, [], 0, 0, { db, userId: '' })
    ]);
    await addOrUpdateFormValue(nodeA.id, 'value', 'NaN', { db, userId: '' });
    await createConnection(
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id },
      { db, userId: '' }
    );

    try {
      await executeNode(nodeB, { db, userId: '' });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Form values or inputs are missing');
    }
  });

  test('should wait for inputs and combine them as sum', async () => {
    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const [nodeA, nodeB] = await Promise.all([
      createNode(NumberInputNodeDef.type, ws.id, [], 0, 0, { db, userId: '' }),
      createNode(NumberInputNodeDef.type, ws.id, [], 0, 0, { db, userId: '' })
    ]);
    const sumNode = await createNode(SumNodeDef.type, ws.id, [], 0, 0, {
      db,
      userId: ''
    });
    const outputNode = await createNode(
      NumberOutputNodeDef.type,
      ws.id,
      [],
      0,
      0,
      { db, userId: '' }
    );

    await addOrUpdateFormValue(nodeA.id, 'value', '18', { db, userId: '' });
    await addOrUpdateFormValue(nodeB.id, 'value', '81', { db, userId: '' });
    await addOrUpdateFormValue(outputNode.id, 'name', JSON.stringify('test'), {
      db,
      userId: ''
    });

    await createConnection(
      { name: 'value', nodeId: nodeA.id },
      { name: 'a', nodeId: sumNode.id },
      { db, userId: '' }
    );
    await createConnection(
      { name: 'value', nodeId: nodeB.id },
      { name: 'b', nodeId: sumNode.id },
      { db, userId: '' }
    );
    await createConnection(
      { name: 'sum', nodeId: sumNode.id },
      { name: 'value', nodeId: outputNode.id },
      { db, userId: '' }
    );

    const updatedNode = await getNode(outputNode.id, { db, userId: '' });
    const { outputs, results } = await executeNode(updatedNode, {
      db,
      userId: ''
    });

    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect((results as any).value).toBe(99);
  });

  test('should support context functions', async () => {
    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const ds = await createDataset('test', { db, userId: '' });
    await addValueSchema(
      ds.id,
      {
        name: 'val',
        type: DataType.STRING,
        unique: true,
        required: true,
        fallback: ''
      },
      { db, userId: '' }
    );
    await createEntry(
      ds.id,
      { val: JSON.stringify('test') },
      { db, userId: '' }
    );

    const [editEntriesNode, inputNode, outputNode] = await Promise.all(
      [
        EditEntriesNodeDef.type,
        DatasetInputNodeDef.type,
        DatasetOutputNodeDef.type
      ].map(type => createNode(type, ws.id, [], 0, 0, { db, userId: '' }))
    );

    const contextOutputNode = await getContextNode(
      editEntriesNode,
      ContextNodeType.OUTPUT,
      { db, userId: '' }
    );

    expect(contextOutputNode).toBeDefined();
    const stringInputNode = await createNode(
      StringInputNodeDef.type,
      ws.id,
      [editEntriesNode.id],
      0,
      0,
      { db, userId: '' }
    );

    await createConnection(
      { name: 'value', nodeId: stringInputNode.id },
      { name: 'val', nodeId: contextOutputNode.id },
      { db, userId: '' }
    );
    await addOrUpdateFormValue(inputNode.id, 'dataset', JSON.stringify(ds.id), {
      db,
      userId: ''
    });
    await addOrUpdateFormValue(
      stringInputNode.id,
      'value',
      JSON.stringify('test'),
      { db, userId: '' }
    );
    await addOrUpdateFormValue(outputNode.id, 'name', 'test', {
      db,
      userId: ''
    });
    await Promise.all(
      [
        { from: inputNode.id, to: editEntriesNode.id },
        { from: editEntriesNode.id, to: outputNode.id }
      ].map(pair =>
        createConnection(
          { name: 'dataset', nodeId: pair.from },
          { name: 'dataset', nodeId: pair.to },
          { db, userId: '' }
        )
      )
    );
    const updatedNode = await getNode(outputNode.id, { db, userId: '' });

    const { outputs, results } = await executeNode(updatedNode, {
      db,
      userId: ''
    });
    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect((results as any).value).toBeDefined();

    const newDsId = (results as any).value.datasetId;
    const allEntries = await getAllEntries(newDsId, { db, userId: '' });
    expect(allEntries.length).toBe(1);
  });

  test('should throw error', async () => {
    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const editEntriesNode = await createNode(
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

    const inputNode = await getContextNode(
      editEntriesNode,
      ContextNodeType.INPUT,
      { db, userId: '' }
    );

    try {
      await executeNode(inputNode, {
        db,
        userId: ''
      });
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Context needs context inputs');
    }
  });
});
