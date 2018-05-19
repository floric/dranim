import { Db, ObjectID } from 'mongodb';
import { getAllNodes, getConnection, getNode } from './workspace';
import { outputNodes, serverNodeTypes } from '../../nodes/AllNodes';
import {
  NodeInstance,
  formToMap,
  CalculationProcessState,
  CalculationProcess,
  NodeExecutionOutputs
} from '@masterthesis/shared';

const startProcess = async (db: Db, processId: string, workspaceId: string) => {
  const processCollection = getCalculationsCollection(db);

  try {
    const nodes = await getAllNodes(db, workspaceId);
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
    console.log(err);
    await processCollection.updateOne(
      { _id: new ObjectID(processId) },
      {
        $set: {
          finish: new Date(),
          state: CalculationProcessState.ERROR
        }
      }
    );
    console.log(`Finished calculation with errors: ${JSON.stringify(err)}`);
  }
};

const executeNode = async (
  db: Db,
  node: NodeInstance
): Promise<NodeExecutionOutputs> => {
  const type = serverNodeTypes.get(node.type);
  if (!type) {
    throw new Error('Unknown node type');
  }

  const inputValues = await Promise.all(
    node.inputs.map(async i => {
      const c = await getConnection(db, i.connectionId);
      const inputNodeId = c.from.nodeId;
      const inputNode = await getNode(db, inputNodeId);
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
  const validForm = type.isFormValid
    ? type.isFormValid(formToMap(node.form))
    : true;
  const validInput = type.isInputValid
    ? await type.isInputValid(inputsMap)
    : true;
  if (!validInput || !validForm) {
    throw new Error('Invalid input.');
  }

  const res = await type.onServerExecution(formToMap(node.form), inputsMap);

  return res.outputs;
};

export const getCalculationsCollection = (db: Db) => {
  return db.collection('Calculations');
};

export const startCalculation = async (
  db: Db,
  workspaceId: string
): Promise<CalculationProcess> => {
  const coll = getCalculationsCollection(db);
  const newProcess = await coll.insertOne({
    start: new Date(),
    finish: null,
    workspaceId,
    processedOutputs: 0,
    totalOutputs: 0,
    state: CalculationProcessState.STARTED
  });

  if (newProcess.result.ok !== 1 || newProcess.ops.length !== 1) {
    throw new Error('Process creation failed');
  }

  const id = newProcess.ops[0]._id.toHexString();

  startProcess(db, id, workspaceId);

  return {
    id,
    ...newProcess.ops[0]
  };
};

export const getAllCalculations = async (
  db: Db,
  workspaceId: string
): Promise<Array<CalculationProcess>> => {
  const collection = getCalculationsCollection(db);
  const all = await collection.find({ workspaceId }).toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};
