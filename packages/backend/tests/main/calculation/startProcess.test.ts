import { MongoClient, Db } from 'mongodb';
import {
  ProcessState,
  NodeInstance,
  NodeState,
  NumberOutputNodeDef,
  NumberInputNodeDef,
  DatasetOutputNodeDef,
  IOValues
} from '@masterthesis/shared';

import {
  startCalculation,
  getAllCalculations
} from '../../../src/main/calculation/startProcess';
import { getAllNodes } from '../../../src/main/workspace/nodes';
import { executeNode } from '../../../src/main/calculation/executeNode';

const WORKSPACE = 'test';

jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/calculation/executeNode');

let connection;
let db: Db;

describe('StartProcess', () => {
  beforeAll(async () => {
    connection = await MongoClient.connect((global as any).__MONGO_URI__);
    db = await connection.db((global as any).__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
    // await db.close();
  });

  beforeEach(async () => {
    await db.dropDatabase();
    jest.resetAllMocks();
  });

  test('should get empty calculations collection', async () => {
    expect.assertions(1);
    const processes = await getAllCalculations(db, WORKSPACE);
    expect(processes.length).toBe(0);
  });

  test('should start new calculation process without any nodes', async () => {
    expect.assertions(13);
    (getAllNodes as jest.Mock).mockImplementation((a, b) =>
      Promise.resolve([])
    );
    const newProcess = await startCalculation(db, WORKSPACE, true);

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.processedOutputs).toBe(0);
    expect(newProcess.totalOutputs).toBe(0);
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(db, WORKSPACE);
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.processedOutputs).toBe(0);
    expect(finishedProcess.totalOutputs).toBe(0);
    expect(finishedProcess.start).toBeDefined();

    expect((getAllNodes as jest.Mock).mock.calls.length).toBe(1);
    expect((executeNode as jest.Mock).mock.calls.length).toBe(0);
  });

  test('should start new calculation process with one node', async done => {
    expect.assertions(13);
    (getAllNodes as jest.Mock).mockImplementation((a, b) =>
      Promise.resolve<Array<NodeInstance>>([
        {
          id: '1',
          form: [],
          inputs: [],
          outputs: [],
          state: NodeState.VALID,
          type: NumberOutputNodeDef.name,
          workspaceId: WORKSPACE,
          x: 0,
          y: 0
        },
        {
          id: '2',
          form: [],
          inputs: [],
          outputs: [],
          state: NodeState.VALID,
          type: DatasetOutputNodeDef.name,
          workspaceId: WORKSPACE,
          x: 0,
          y: 0
        },
        {
          id: '3',
          form: [],
          inputs: [],
          outputs: [],
          state: NodeState.VALID,
          type: NumberInputNodeDef.name,
          workspaceId: WORKSPACE,
          x: 0,
          y: 0
        }
      ])
    );
    (executeNode as jest.Mock).mockImplementation(n =>
      Promise.resolve<IOValues<{}>>({})
    );
    const newProcess = await startCalculation(db, WORKSPACE, true);

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.processedOutputs).toBe(0);
    expect(newProcess.totalOutputs).toBe(0);
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(db, WORKSPACE);
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.SUCCESSFUL);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.processedOutputs).toBe(2);
    expect(finishedProcess.totalOutputs).toBe(2);
    expect(finishedProcess.start).toBeDefined();

    expect((getAllNodes as jest.Mock).mock.calls.length).toBe(1);
    expect((executeNode as jest.Mock).mock.calls.length).toBe(2);

    done();
  });

  test('should catch error for failed node execution', async () => {
    (getAllNodes as jest.Mock).mockImplementation((a, b) =>
      Promise.resolve<Array<NodeInstance>>([
        {
          id: '1',
          form: [],
          inputs: [],
          outputs: [],
          state: NodeState.VALID,
          type: NumberOutputNodeDef.name,
          workspaceId: WORKSPACE,
          x: 0,
          y: 0
        }
      ])
    );
    (executeNode as jest.Mock).mockImplementation(n => {
      throw new Error('Something went wrong during node execution.');
    });
    const newProcess = await startCalculation(db, WORKSPACE, true);

    expect(newProcess.state).toBe(ProcessState.STARTED);
    expect(newProcess.finish).toBeNull();
    expect(newProcess.processedOutputs).toBe(0);
    expect(newProcess.totalOutputs).toBe(0);
    expect(newProcess.start).toBeDefined();

    const processes = await getAllCalculations(db, WORKSPACE);
    expect(processes.length).toBe(1);

    const finishedProcess = processes[0];
    expect(finishedProcess.state).toBe(ProcessState.ERROR);
    expect(finishedProcess.finish).toBeDefined();
    expect(finishedProcess.processedOutputs).toBe(0);
    expect(finishedProcess.totalOutputs).toBe(1);
    expect(finishedProcess.start).toBeDefined();

    expect((getAllNodes as jest.Mock).mock.calls.length).toBe(1);
    expect((executeNode as jest.Mock).mock.calls.length).toBe(1);
  });
});
