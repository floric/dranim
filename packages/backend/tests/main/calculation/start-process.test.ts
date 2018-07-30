import {
  DatasetOutputNodeDef,
  DataType,
  IOValues,
  NumberInputNodeDef,
  NumberOutputNodeDef,
  OutputResult,
  ProcessState
} from '@masterthesis/shared';
import { Db } from 'mongodb';

import { executeNode } from '../../../src/main/calculation/execution';
import {
  getAllCalculations,
  startCalculation
} from '../../../src/main/calculation/start-process';
import { addOrUpdateResult } from '../../../src/main/dashboards/results';
import { createNode } from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { getTestMongoDb } from '../../test-utils';

let conn;
let db: Db;
let server;

jest.mock('../../../src/main/calculation/execution');
jest.mock('../../../src/main/dashboards/results');

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
    const ws = await createWorkspace('test', { db, userId: '' }, '');

    const processes = await getAllCalculations(ws.id, { db, userId: '' });

    expect(processes.length).toBe(0);
  });

  test('should start new calculation process without any nodes', async () => {
    (executeNode as jest.Mock).mockImplementation(n =>
      Promise.resolve<IOValues<{}>>({ outputs: {}, results: {} })
    );

    const ws = await createWorkspace('test', { db, userId: '' }, '');
    const newProcess = await startCalculation(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.processedOutputs).toBe(0);
    expect(newProcess.totalOutputs).toBe(0);
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.processedOutputs).toBe(0);
    expect(finishedProcess.totalOutputs).toBe(0);
    expect(finishedProcess.start).toBeDefined();

    expect((executeNode as jest.Mock).mock.calls.length).toBe(0);
  });

  test('should start new calculation process with one node', async () => {
    (executeNode as jest.Mock).mockImplementation(n =>
      Promise.resolve<IOValues<{}>>({ outputs: {}, results: {} })
    );

    const ws = await createWorkspace('test', { db, userId: '' }, '');
    await Promise.all(
      [
        {
          type: NumberOutputNodeDef.type,
          workspaceId: ws.id,
          x: 0,
          y: 0
        },
        {
          type: DatasetOutputNodeDef.type,
          workspaceId: ws.id,
          x: 0,
          y: 0
        },
        {
          type: NumberInputNodeDef.type,
          workspaceId: ws.id,
          x: 0,
          y: 0
        }
      ].map(n =>
        createNode(n.type, n.workspaceId, [], n.x, n.y, { db, userId: '' })
      )
    );

    const newProcess = await startCalculation(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.processedOutputs).toBe(0);
    expect(newProcess.totalOutputs).toBe(0);
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.processedOutputs).toBe(2);
    expect(finishedProcess.totalOutputs).toBe(2);
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
    (executeNode as jest.Mock)
      .mockResolvedValueOnce({ outputs: {}, results: { resultA } })
      .mockResolvedValueOnce({ outputs: {}, results: { resultB } });

    const ws = await createWorkspace('test', { db, userId: '' }, '');
    await Promise.all(
      [
        {
          type: NumberOutputNodeDef.type,
          workspaceId: ws.id,
          x: 0,
          y: 0
        },
        {
          type: DatasetOutputNodeDef.type,
          workspaceId: ws.id,
          x: 0,
          y: 0
        },
        {
          type: NumberInputNodeDef.type,
          workspaceId: ws.id,
          x: 0,
          y: 0
        }
      ].map(n =>
        createNode(n.type, n.workspaceId, [], n.x, n.y, { db, userId: '' })
      )
    );

    const newProcess = await startCalculation(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.processedOutputs).toBe(0);
    expect(newProcess.totalOutputs).toBe(0);
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.processedOutputs).toBe(2);
    expect(finishedProcess.totalOutputs).toBe(2);
    expect(finishedProcess.start).toBeDefined();

    expect(executeNode as jest.Mock).toHaveBeenCalledTimes(2);
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

  test('should catch error for failed node execution', async () => {
    (executeNode as jest.Mock).mockImplementation(n => {
      throw new Error('Something went wrong during node execution.');
    });

    const ws = await createWorkspace('test', { db, userId: '' }, '');
    await Promise.all(
      [
        {
          type: NumberOutputNodeDef.type,
          workspaceId: ws.id,
          x: 0,
          y: 0
        }
      ].map(n =>
        createNode(n.type, n.workspaceId, [], n.x, n.y, { db, userId: '' })
      )
    );

    const newProcess = await startCalculation(
      ws.id,
      { db, userId: '' },
      { awaitResult: true }
    );

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.processedOutputs).toBe(0);
    expect(newProcess.totalOutputs).toBe(0);
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(ws.id, { db, userId: '' });
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.ERROR);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.processedOutputs).toBe(0);
    expect(finishedProcess.totalOutputs).toBe(1);
    expect(finishedProcess.start).toBeDefined();

    expect((executeNode as jest.Mock).mock.calls.length).toBe(1);
  });
});
