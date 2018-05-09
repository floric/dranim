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
  processedOutputs: number;
  totalOutputs: number;
  state: CalculationProcessState;
}

const startProcess = async (db: Db, processId: string) => {
  const processCollection = getCalculationsCollection(db);

  try {
    const connections = await allConnections(db);
    const nodes = await allNodes(db);
    const outputs = nodes.filter(n => outputNodes.includes(n.type));

    await processCollection.updateOne(
      { _id: new ObjectID(processId) },
      {
        $set: {
          totalOutputs: outputs.length,
          state: CalculationProcessState.PROCESSING
        }
      }
    );

    await Promise.all(
      outputs.map(async o => {
        const resultsFromOutput = await executeNode(db, o);
        console.log(
          `${o.type}: ${JSON.stringify(
            Array.from(resultsFromOutput.entries())
          )}`
        );
        await processCollection.updateOne(
          { _id: new ObjectID(processId) },
          {
            $inc: {
              processedOutputs: 1
            }
          }
        );
      })
    );

    await processCollection.updateOne(
      { _id: new ObjectID(processId) },
      {
        $set: {
          finish: new Date(),
          state: CalculationProcessState.SUCCESSFUL
        }
      }
    );

    console.log('Finished calculation.');
  } catch (err) {
    await processCollection.updateOne(
      { _id: new ObjectID(processId) },
      {
        $set: {
          finish: new Date(),
          state: CalculationProcessState.ERROR
        }
      }
    );
    console.log('Finished calculation with errors.');
  }
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

export const getCalculationsCollection = (db: Db) => {
  return db.collection('Calculations');
};

export const startCalculation = async (db: Db): Promise<CalculationProcess> => {
  const coll = getCalculationsCollection(db);
  const newProcess = await coll.insertOne({
    start: new Date(),
    finish: null,
    processedOutputs: 0,
    totalOutputs: 0,
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

export const getAllCalculations = async (
  db: Db
): Promise<Array<CalculationProcess>> => {
  const collection = getCalculationsCollection(db);
  const all = await collection.find({}).toArray();
  return all.map(ds => ({
    id: ds._id,
    ...ds
  }));
};
