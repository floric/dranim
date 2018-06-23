import {
  BooleanOutputNodeDef,
  ContextNodeType,
  DatasetInputNodeDef,
  DatasetOutputNodeDef,
  DataType,
  EditEntriesNodeDef,
  JoinDatasetsNodeDef,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  StringInputNodeDef,
  StringOutputNodeDef,
  SumNodeDef
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  areNodeInputsValid,
  isInputValid,
  isNodeInMetaValid
} from '../../../src/main/calculation/validation';
import { StringOutputNode } from '../../../src/main/nodes/string';
import { createConnection } from '../../../src/main/workspace/connections';
import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { createEntry, getAllEntries } from '../../../src/main/workspace/entry';
import {
  createNode,
  getNode,
  getNodesCollection
} from '../../../src/main/workspace/nodes';
import {
  addOrUpdateFormValue,
  getContextNode
} from '../../../src/main/workspace/nodes-detail';
import {
  createWorkspace,
  getWorkspace
} from '../../../src/main/workspace/workspace';
import {
  getTestMongoDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

let conn;
let db: Db;
let server;

describe('Validation', () => {
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

  test('should validate simple nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const [inputNode, outputNode] = await Promise.all([
      createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, StringOutputNode.type, ws.id, [], 0, 0)
    ]);

    await addOrUpdateFormValue(
      db,
      inputNode.id,
      'value',
      JSON.stringify('test')
    );
    await createConnection(
      db,
      { nodeId: inputNode.id, name: 'value' },
      { nodeId: outputNode.id, name: 'value' }
    );

    const node = await getNode(db, outputNode.id);
    let res = await isNodeInMetaValid(node, db);
    expect(res).toBe(true);

    res = await areNodeInputsValid(node, { value: 'test' }, db);
    expect(res).toBe(true);
  });

  test('should validate nodes without connection as invalid', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const [inputNode, outputNode] = await Promise.all([
      createNode(db, StringInputNodeDef.type, ws.id, [], 0, 0),
      createNode(db, StringOutputNode.type, ws.id, [], 0, 0)
    ]);

    await addOrUpdateFormValue(
      db,
      inputNode.id,
      'value',
      JSON.stringify('test')
    );

    const node = await getNode(db, outputNode.id);
    let res = await isNodeInMetaValid(node, db);
    expect(res).toBe(false);

    res = await areNodeInputsValid(node, { value: 'test' }, db);
    expect(res).toBe(true);
  });

  test('should validate nodes without form input as invalid', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const inputNode = await createNode(
      db,
      StringInputNodeDef.type,
      ws.id,
      [],
      0,
      0
    );

    const node = await getNode(db, inputNode.id);
    const res = await isNodeInMetaValid(node, db);
    expect(res).toBe(false);
  });

  test('should validate context input nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const eeNode = await createNode(
      db,
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const inputNode = await getContextNode(eeNode, ContextNodeType.INPUT, db);
    const res = await isNodeInMetaValid(inputNode, db);
    expect(res).toBe(true);
  });

  test.skip('should validate context output nodes', async () => {
    const ws = await createWorkspace(db, 'test', '');
    const eeNode = await createNode(
      db,
      EditEntriesNodeDef.type,
      ws.id,
      [],
      0,
      0
    );
    const outputNode = await getContextNode(eeNode, ContextNodeType.OUTPUT, db);
    const res = await isNodeInMetaValid(outputNode, db);
    expect(res).toBe(true);
  });

  test('should have invalid dataset input', async () => {
    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: DatasetOutputNodeDef.type,
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      {},
      db
    );
    expect(res).toBe(false);
  });

  test('should have dataset input with invalid id', async () => {
    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: DatasetOutputNodeDef.type,
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      { dataset: { datasetId: VALID_OBJECT_ID } },
      db
    );
    expect(res).toBe(false);
  });

  test('should have dataset input', async () => {
    const ds = await createDataset(db, 'test');
    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: DatasetOutputNodeDef.type,
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      { dataset: { datasetId: ds.id } },
      db
    );
    expect(res).toBe(true);
  });

  test('should have invalid input with different name', async () => {
    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: NumberOutputNodeDef.type,
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      { test: 'abc' },
      db
    );
    expect(res).toBe(false);
  });

  test('should have valid and invalid input', async () => {
    const ds = await createDataset(db, 'test');
    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: JoinDatasetsNodeDef.type,
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      {
        datasetA: { datasetId: ds.id },
        datasetB: { datasetId: null }
      },
      db
    );
    expect(res).toBe(false);
  });

  test('should have invalid input', async () => {
    let res = await isInputValid(undefined, DataType.STRING, db);
    expect(res).toBe(false);

    res = await isInputValid(null, DataType.NUMBER, db);
    expect(res).toBe(false);
  });

  test('should have valid number input', async () => {
    let res = await isInputValid(9.4523, DataType.NUMBER, db);
    expect(res).toBe(true);

    res = await isInputValid(0, DataType.NUMBER, db);
    expect(res).toBe(true);

    res = await isInputValid(-0.3, DataType.NUMBER, db);
    expect(res).toBe(true);

    res = await isInputValid(11, DataType.NUMBER, db);
    expect(res).toBe(true);
  });

  test('should have invalid number input', async () => {
    let res = await isInputValid(NaN, DataType.NUMBER, db);
    expect(res).toBe(false);

    res = await isInputValid({}, DataType.NUMBER, db);
    expect(res).toBe(false);

    res = await isInputValid('9', DataType.NUMBER, db);
    expect(res).toBe(false);
  });

  test('should have valid string input', async () => {
    let res = await isInputValid('true', DataType.STRING, db);
    expect(res).toBe(true);

    res = await isInputValid('', DataType.STRING, db);
    expect(res).toBe(true);
  });

  test('should have invalid string input', async () => {
    let res = await isInputValid(9, DataType.STRING, db);
    expect(res).toBe(false);

    res = await isInputValid({}, DataType.STRING, db);
    expect(res).toBe(false);
  });

  test('should have valid boolean input', async () => {
    let res = await isInputValid(true, DataType.BOOLEAN, db);
    expect(res).toBe(true);

    res = await isInputValid(false, DataType.BOOLEAN, db);
    expect(res).toBe(true);
  });

  test('should have invalid boolean input', async () => {
    let res = await isInputValid('true', DataType.BOOLEAN, db);
    expect(res).toBe(false);

    res = await isInputValid(0, DataType.BOOLEAN, db);
    expect(res).toBe(false);
  });

  test('should have valid time input', async () => {
    const res = await isInputValid(new Date(), DataType.TIME, db);
    expect(res).toBe(true);
  });

  test('should have invalid time input', async () => {
    const res = await isInputValid({}, DataType.TIME, db);
    expect(res).toBe(false);
  });

  test('should have valid datetime input', async () => {
    const res = await isInputValid(new Date(), DataType.DATETIME, db);
    expect(res).toBe(true);
  });

  test('should have invalid datetime input', async () => {
    const res = await isInputValid({}, DataType.DATETIME, db);
    expect(res).toBe(false);
  });

  test('should return true for validation of unknown datatypes', async () => {
    const res = await isInputValid({}, 'test' as any, db);
    expect(res).toBe(true);
  });
});
