import {
  ApolloContext,
  DatasetOutputNodeDef,
  DataType,
  IOValues,
  NodeInstance,
  NodeState,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  OutputResult,
  ProcessState,
  sleep,
  Workspace
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { executeNode } from '../../../src/main/calculation/execution';
import {
  CANCEL_CHECKS_MS,
  getAllCalculations,
  startProcess,
  stopCalculation,
  tryGetCalculation
} from '../../../src/main/calculation/start-process';
import { addOrUpdateResult } from '../../../src/main/dashboards/results';
import { clearGeneratedDatasets } from '../../../src/main/workspace/dataset';
import { getAllNodes } from '../../../src/main/workspace/nodes';
import { getTestMongoDb, VALID_OBJECT_ID } from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/calculation/execution');
jest.mock('../../../src/main/dashboards/results');
jest.mock('../../../src/main/workspace/workspace');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/dataset');

const ws: Workspace = {
  name: 'test',
  description: '',
  created: '',
  id: VALID_OBJECT_ID,
  lastChange: ''
};

describe('Start Process', () => {
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

  test('should get empty calculations collection', async () => {
    const processes = await getAllCalculations(ws.id, { db, userId: '' });

    expect(processes.length).toBe(0);
  });

  test('should start new calculation process without any nodes', async () => {
    (executeNode as jest.Mock).mockImplementation(() =>
      Promise.resolve<IOValues<{}>>({ outputs: {}, results: {} })
    );
    (getAllNodes as jest.Mock).mockResolvedValue([]);

    const newProcess = await startProcess(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.start).toBeDefined();

    expect((executeNode as jest.Mock).mock.calls.length).toBe(0);
  });

  test('should start new calculation process with one node', async () => {
    const nodes: Array<NodeInstance> = [
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: NumberOutputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: DatasetOutputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: NumberInputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      }
    ];
    (executeNode as jest.Mock).mockImplementation(n =>
      Promise.resolve<IOValues<{}>>({ outputs: {}, results: {} })
    );
    (getAllNodes as jest.Mock).mockResolvedValue(nodes);

    const newProcess = await startProcess(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.start).toBeDefined();

    expect((executeNode as jest.Mock).mock.calls.length).toBe(2);
  });

  test('should start new calculation process with one node with results', async () => {
    const resultA: OutputResult<number> = {
      workspaceId: '123',
      type: DataType.NUMBER,
      name: 'n',
      value: 9,
      description: 'desc'
    };
    const resultB: OutputResult<string> = {
      workspaceId: '123',
      type: DataType.STRING,
      name: 'n',
      value: 'test',
      description: 'desc'
    };
    const nodes: Array<NodeInstance> = [
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: NumberOutputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: DatasetOutputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      },
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: NumberInputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      }
    ];
    (executeNode as jest.Mock)
      .mockResolvedValueOnce({ outputs: {}, results: { resultA } })
      .mockResolvedValueOnce({ outputs: {}, results: { resultB } });
    (getAllNodes as jest.Mock).mockResolvedValue(nodes);

    const newProcess = await startProcess(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.start).toBeDefined();

    expect(executeNode as jest.Mock).toHaveBeenCalledTimes(2);
    expect(clearGeneratedDatasets).toHaveBeenCalledTimes(1);
    expect(addOrUpdateResult as jest.Mock).toHaveBeenCalledTimes(2);
    expect(addOrUpdateResult as jest.Mock).toHaveBeenCalledWith(
      { resultA },
      {
        db,
        userId: ''
      }
    );
    expect(addOrUpdateResult as jest.Mock).toHaveBeenCalledWith(
      { resultB },
      {
        db,
        userId: ''
      }
    );
  });

  test('should stop calculation', async () => {
    const calculation = await startProcess(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    const res = await stopCalculation(calculation.id, { db, userId: '' });
    expect(res).toBe(true);
  });

  test('should get calculation', async () => {
    const calculation = await startProcess(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    const res = await tryGetCalculation(calculation.id, { db, userId: '' });
    expect({
      ...res,
      ...{ finish: null, state: ProcessState.STARTED }
    }).toEqual(calculation);
  });

  test('should not get calculation', async () => {
    const reqContext: ApolloContext = { userId: '', db };

    try {
      const res = await tryGetCalculation('abc', reqContext);
      expect(res).toBe(null);
    } catch (e) {
      expect(e.message).toBe('Unknown calculation');
    }

    try {
      const res = await tryGetCalculation(VALID_OBJECT_ID, reqContext);
      expect(res).toBe(null);
    } catch (e) {
      expect(e.message).toBe('Unknown calculation');
    }
  });

  test('should catch error for failed node execution', async () => {
    (executeNode as jest.Mock).mockImplementation(n => {
      throw new Error('Something went wrong during node execution.');
    });
    (getAllNodes as jest.Mock).mockResolvedValue([
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: NumberOutputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      }
    ]);

    const newProcess = await startProcess(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.ERROR);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.start).toBeDefined();

    expect(executeNode).toHaveBeenCalledTimes(1);
    expect(clearGeneratedDatasets).toHaveBeenCalledTimes(1);
  });

  test('should check for canceled process and clear datasets', async () => {
    jest.setTimeout(10000);
    const nodes: Array<NodeInstance> = [
      {
        contextIds: [],
        form: [],
        id: VALID_OBJECT_ID,
        inputs: [],
        outputs: [],
        state: NodeState.VALID,
        type: NumberOutputNodeDef.type,
        variables: {},
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0
      }
    ];
    (executeNode as jest.Mock).mockImplementation(async () => {
      await sleep(7000);
      throw new Error('Should have been stopped');
    });
    (getAllNodes as jest.Mock).mockResolvedValue(nodes);

    let res = await startProcess(ws.id, { db, userId: '' });

    await sleep(100);
    const stopRes = await stopCalculation(res.id, { db, userId: '' });
    await sleep(CANCEL_CHECKS_MS);

    res = await tryGetCalculation(res.id, { db, userId: '' });
    const { finish, id, start, ...otherRes } = res;

    expect(stopRes).toBe(true);
    expect(clearGeneratedDatasets).toHaveBeenCalledTimes(1);
    expect(otherRes).toEqual({
      state: ProcessState.CANCELED,
      userId: '',
      workspaceId: VALID_OBJECT_ID
    });
  });

  test('should stop cancel check for successful job', async () => {
    jest.setTimeout(10000);
    (getAllNodes as jest.Mock).mockResolvedValue([]);

    let res = await startProcess(ws.id, { db, userId: '' });

    await sleep(CANCEL_CHECKS_MS * 1.5);

    res = await tryGetCalculation(res.id, { db, userId: '' });
    const { finish, id, start, ...otherRes } = res;

    expect(clearGeneratedDatasets).toHaveBeenCalled();
    expect(otherRes).toEqual({
      state: ProcessState.SUCCESSFUL,
      userId: '',
      workspaceId: VALID_OBJECT_ID
    });
  });
});
