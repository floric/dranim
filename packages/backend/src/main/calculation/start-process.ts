import {
  CalculationProcess,
  NodeInstance,
  ProcessState
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { executeServerNode } from '../calculation/server-execution';
import { serverNodeTypes } from '../nodes/all-nodes';
import { getAllNodes } from '../workspace/nodes';

const startProcess = async (db: Db, processId: string, workspaceId: string) => {
  const processCollection = getCalculationsCollection(db);

  try {
    const nodes = await getAllNodes(db, workspaceId);
    const outputNodesInstances = nodes.filter(
      n =>
        serverNodeTypes.has(n.type)
          ? serverNodeTypes.get(n.type)!.isOutputNode === true
          : false
    );

    await processCollection.updateOne(
      { _id: new ObjectID(processId) },
      {
        $set: {
          totalOutputs: outputNodesInstances.length,
          state: ProcessState.PROCESSING
        }
      }
    );

    await Promise.all(
      outputNodesInstances.map(o => executeOutputNode(db, o, processId))
    );

    await updateFinishedProcess(db, processId, ProcessState.SUCCESSFUL);
  } catch (err) {
    await updateFinishedProcess(db, processId, ProcessState.ERROR);
    if (process.env.NODE_ENV !== 'test') {
      console.error('Finished calculation with errors.', err);
    }
  }
};

const executeOutputNode = async (
  db: Db,
  o: NodeInstance,
  processId: string
) => {
  const processCollection = getCalculationsCollection(db);

  // TODO Display results somewhere
  await executeServerNode(db, o.id);
  await processCollection.updateOne(
    { _id: new ObjectID(processId) },
    {
      $inc: {
        processedOutputs: 1
      }
    }
  );
};

const updateFinishedProcess = async (
  db: Db,
  processId: string,
  state: ProcessState
) => {
  const processCollection = getCalculationsCollection(db);
  await processCollection.updateOne(
    { _id: new ObjectID(processId) },
    {
      $set: {
        finish: new Date(),
        state
      }
    }
  );
};

const getCalculationsCollection = (
  db: Db
): Collection<CalculationProcess & { _id: ObjectID }> => {
  return db.collection('Calculations');
};

export const startCalculation = async (
  db: Db,
  workspaceId: string,
  awaitResult?: boolean
): Promise<CalculationProcess> => {
  const coll = getCalculationsCollection(db);
  const newProcess = await coll.insertOne({
    start: new Date(),
    finish: null,
    workspaceId,
    processedOutputs: 0,
    totalOutputs: 0,
    state: ProcessState.STARTED
  });

  if (newProcess.result.ok !== 1 || newProcess.ops.length !== 1) {
    throw new Error('Process creation failed');
  }

  const id = newProcess.ops[0]._id.toHexString();

  if (awaitResult === true) {
    await startProcess(db, id, workspaceId);
  } else {
    startProcess(db, id, workspaceId);
  }

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
