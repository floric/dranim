import {
  NumberInputNodeDef,
  NumberOutputNodeDef,
  StringInputNodeDef,
  StringOutputNodeDef,
  SumNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { executeNode } from '../../../src/main/calculation/execute-node';
import { createConnection } from '../../../src/main/workspace/connections';
import {
  addOrUpdateFormValue,
  createNode
} from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { getTestMongoDb, NeverGoHereError } from '../../test-utils';

let conn;
let db: Db;
let server;

describe('Execute Node', () => {
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
    const node = await createNode(db, StringInputNodeDef.name, ws.id, 0, 0);

    const { outputs, results } = await executeNode(db, node.id);

    expect(outputs).toBeDefined();
    expect(results).toBeUndefined();
    expect(Object.keys(outputs).length).toBe(1);
  });

  test('should execute connected nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const nodeA = await createNode(db, StringInputNodeDef.name, ws.id, 0, 0);
    const nodeB = await createNode(db, StringOutputNodeDef.name, ws.id, 0, 0);
    await createConnection(
      db,
      { name: 'string', nodeId: nodeA.id },
      { name: 'string', nodeId: nodeB.id }
    );

    const { outputs, results } = await executeNode(db, nodeB.id);

    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect(Object.keys(outputs).length).toBe(0);
    expect(Object.keys(results).length).toBe(1);
  });

  test('should fail for invalid form', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const node = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);
    await addOrUpdateFormValue(db, node.id, 'value', '{NaN');

    try {
      await executeNode(db, node.id);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid form.');
    }
  });

  test('should fail for invalid input', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const nodeA = await createNode(db, StringInputNodeDef.name, ws.id, 0, 0);
    const nodeB = await createNode(db, NumberOutputNodeDef.name, ws.id, 0, 0);
    await addOrUpdateFormValue(db, nodeA.id, 'value', 'NaN');

    await createConnection(
      db,
      { name: 'value', nodeId: nodeA.id },
      { name: 'value', nodeId: nodeB.id }
    );

    try {
      await executeNode(db, nodeB.id);
      throw NeverGoHereError;
    } catch (err) {
      expect(err.message).toBe('Invalid input.');
    }
  });

  test('should wait for inputs and combine them as sum', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const nodeA = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);
    const nodeB = await createNode(db, NumberInputNodeDef.name, ws.id, 0, 0);
    const sumNode = await createNode(db, SumNodeDef.name, ws.id, 0, 0);
    const outputNode = await createNode(
      db,
      NumberOutputNodeDef.name,
      ws.id,
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

    const { outputs, results } = await executeNode(db, outputNode.id);

    expect(outputs).toBeDefined();
    expect(results).toBeDefined();
    expect((results as any).value).toBe(99);
  });
});
