import {
  ApolloContext,
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

const startProcess = async (
  processId: string,
  workspaceId: string,
  reqContext: ApolloContext
) => {
  const processCollection = getCalculationsCollection(reqContext.db);

  try {
    await clearGeneratedDatasets(workspaceId, reqContext);
    const nodes = await getAllNodes(workspaceId, reqContext);
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
      outputNodesInstances.map(o => executeOutputNode(o, processId, reqContext))
    );
    await saveResults(results as Array<OutputResult>, reqContext);
    await updateFinishedProcess(
      processId,
      workspaceId,
      ProcessState.SUCCESSFUL,
      reqContext
    );
    console.log('Finished calcuation successfully.');
  } catch (err) {
    await updateFinishedProcess(
      processId,
      workspaceId,
      ProcessState.ERROR,
      reqContext
    );
    console.error('Finished calculation with errors', err);
  }
};

const saveResults = async (
  results: Array<OutputResult | undefined>,
  reqContext: ApolloContext
) =>
  Promise.all(
    results
      .filter(r => r != null && Object.keys(r).length > 0)
      .filter(r => r!.type !== DataType.DATASET)
      .map(r => addOrUpdateResult(r!, reqContext))
  );

const executeOutputNode = async (
  o: NodeInstance,
  processId: string,
  reqContext: ApolloContext
) => {
  const processCollection = getCalculationsCollection(reqContext.db);

  const res = await executeNode(o, reqContext);
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
  processId: string,
  workspaceId: string,
  state: ProcessState,
  reqContext: ApolloContext
) => {
  const processCollection = getCalculationsCollection(reqContext.db);
  await processCollection.updateOne(
    { _id: new ObjectID(processId) },
    {
      $set: {
        finish: new Date(),
        state
      }
    }
  );
  await resetProgress(workspaceId, reqContext);
};

const getCalculationsCollection = (
  db: Db
): Collection<CalculationProcess & { _id: ObjectID }> => {
  return db.collection('Calculations');
};

export const startCalculation = async (
  workspaceId: string,
  reqContext: ApolloContext,
  awaitResult?: boolean
): Promise<CalculationProcess> => {
  const coll = getCalculationsCollection(reqContext.db);
  const newProcess = await coll.insertOne({
    userId: reqContext.userId,
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
    await startProcess(id, workspaceId, reqContext);
  } else {
    startProcess(id, workspaceId, reqContext);
  }

  return {
    id,
    ...newProcess.ops[0]
  };
};

export const getAllCalculations = async (
  workspaceId: string,
  reqContext: ApolloContext
): Promise<Array<CalculationProcess>> => {
  const collection = getCalculationsCollection(reqContext.db);
  const all = await collection
    .find({ workspaceId, userId: reqContext.userId })
    .toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};
