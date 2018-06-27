import {
  CalculationProcess,
  DataType,
  NodeInstance,
  OutputResult,
  ProcessState
} from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { executeNode } from '../calculation/execution';
import { addOrUpdateResult } from '../dashboards/results';
import { getNodeType, hasNodeType } from '../nodes/all-nodes';
import { clearGeneratedDatasets } from '../workspace/dataset';
import { getAllNodes, resetProgress } from '../workspace/nodes';

const startProcess = async (db: Db, processId: string, workspaceId: string) => {
  const processCollection = getCalculationsCollection(db);

  try {
    await clearGeneratedDatasets(db, workspaceId);
    const nodes = await getAllNodes(db, workspaceId);
    const outputNodesInstances = nodes.filter(
      n =>
        hasNodeType(n.type) ? getNodeType(n.type)!.isOutputNode === true : false
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

    console.log('Started calculation.');

    const results = await Promise.all(
      outputNodesInstances.map(o => executeOutputNode(db, o, processId))
    );
    await saveResults(results as Array<OutputResult>, db);
    await updateFinishedProcess(
      db,
      processId,
      workspaceId,
      ProcessState.SUCCESSFUL
    );
    console.log('Finished calcuation successfully.');
  } catch (err) {
    await updateFinishedProcess(db, processId, workspaceId, ProcessState.ERROR);
    console.error('Finished calculation with errors', err);
  }
};

const saveResults = async (results: Array<OutputResult | undefined>, db: Db) =>
  Promise.all(
    results
      .filter(r => r != null && Object.keys(r).length > 0)
      .filter(r => r!.type !== DataType.DATASET)
      .map(r => addOrUpdateResult(r!, db))
  );

const executeOutputNode = async (
  db: Db,
  o: NodeInstance,
  processId: string
) => {
  const processCollection = getCalculationsCollection(db);

  const res = await executeNode(db, o);
  await processCollection.updateOne(
    { _id: new ObjectID(processId) },
    {
      $inc: {
        processedOutputs: 1
      }
    }
  );

  return res.results;
};

const updateFinishedProcess = async (
  db: Db,
  processId: string,
  workspaceId: string,
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
  await resetProgress(workspaceId, db);
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
