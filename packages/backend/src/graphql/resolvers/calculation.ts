import { Db, ObjectID } from 'mongodb';
import {
  allNodes,
  allConnections,
  Node,
  getConnection,
  getNode
} from './editor';
import { mongoDbClient } from '../../config/db';
import {
  outputNodes,
  nodeTypes,
  NodeExecutionOutputs
} from '../../nodes/AllNodes';
import { exec } from 'child_process';

export enum CalculationProcessState {
  STARTED = 'STARTED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  SUCCESSFUL = 'SUCCESSFUL'
}

export interface CalculationProcess {
  id: string;
  start: string;
  finish: string | null;
  state: CalculationProcessState;
}

const startProcess = async (db: Db, processId: string) => {
  const connections = await allConnections(db);
  const nodes = await allNodes(db);
  const outputs = nodes.filter(n => outputNodes.includes(n.type));

  outputs.forEach(async o => {
    const resultsFromOutput = await executeNode(db, o);
    console.log(resultsFromOutput);
    console.log(
      `${o.type}: ${JSON.stringify(Array.from(resultsFromOutput.entries()))}`
    );
  });
};

const executeNode = async (
  db: Db,
  node: Node
): Promise<NodeExecutionOutputs> => {
  const type = nodeTypes.get(node.type);
  if (!type) {
    throw new Error('Unknown node type');
  }

  const inputValues = await Promise.all(
    node.inputs.map(async i => {
      const c = await getConnection(db, new ObjectID(i.connectionId));
      const inputNodeId = c.from.nodeId;
      const inputNode = await getNode(db, new ObjectID(inputNodeId));
      if (!inputNode) {
        throw new Error('Node not found!');
      }

      const nodeRes = await executeNode(db, inputNode);

      return { socketName: i.name, val: nodeRes.get(c.from.name) };
    })
  );

  const inputsMap = new Map(
    inputValues.map<[string, string]>(i => [i.socketName, i.val])
  );
  const validForm = type.isFormValid ? type.isFormValid(node.form) : true;
  const validInput = await type.isInputValid(inputsMap);
  if (!validInput || !validForm) {
    throw new Error('Invalid input.');
  }

  const res = await type.onServerExecution(node.form, inputsMap);

  return res.outputs;
};

export const getProcessesCollection = (db: Db) => {
  return db.collection('Processes');
};

export const startCalculation = async (db: Db): Promise<CalculationProcess> => {
  const coll = getProcessesCollection(db);
  const newProcess = await coll.insertOne({
    start: new Date(),
    finish: null,
    state: CalculationProcessState.STARTED
  });
  if (newProcess.result.ok !== 1 || newProcess.ops.length !== 1) {
    throw new Error('Process creation failed');
  }

  const id = newProcess.ops[0]._id;

  startProcess(db, id);

  return {
    id,
    ...newProcess.ops[0]
  };
};
