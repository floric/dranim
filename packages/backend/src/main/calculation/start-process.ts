import {
  ApolloContext,
  CalculationProcess,
  NodeInstance,
  NodeOutputResult,
  ProcessState
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';
import Raven from 'raven';

import { Log } from '../../logging';
import { Omit } from '../../main';
import { executeNode } from '../calculation/execution';
import { addOrUpdateResult } from '../dashboards/results';
import { getNodeType, hasNodeType } from '../nodes/all-nodes';
import { checkLoggedInUser } from '../users/management';
import { getSafeObjectID } from '../utils';
import { clearGeneratedDatasets } from '../workspace/dataset';
import { getAllNodes } from '../workspace/nodes';
import { resetProgress } from '../workspace/nodes-detail';

export const CANCEL_CHECKS_MS = 5000;

export interface StartCalculationOptions {
  awaitResult?: boolean;
}

export const startProcess = async (
  workspaceId: string,
  reqContext: ApolloContext,
  options?: StartCalculationOptions
): Promise<CalculationProcess> => {
  checkLoggedInUser(reqContext);

  const coll = getCalculationsCollection<
    Omit<CalculationProcess, 'id' | 'start'> & { start: Date }
  >(reqContext.db);
  const newProcess = await coll.insertOne({
    userId: reqContext.userId!,
    start: new Date(),
    finish: null,
    workspaceId,
    state: ProcessState.STARTED
  });

  if (newProcess.result.ok !== 1 || newProcess.ops.length !== 1) {
    throw new Error('Process creation failed');
  }

  const { _id, ...obj } = newProcess.ops[0];
  const id = _id.toHexString();

  if (options && options.awaitResult) {
    await doCalculation(id, workspaceId, reqContext);
  } else {
    doCalculation(id, workspaceId, reqContext);
  }

  return {
    id,
    ...obj
  };
};

const doCalculation = async (
  processId: string,
  workspaceId: string,
  reqContext: ApolloContext
) => {
  const processCollection = getCalculationsCollection(reqContext.db);

  try {
    const start = new Date().getTime();
    const outputNodes = getOutputNodes(
      await getAllNodes(workspaceId, reqContext)
    );

    await Promise.all([
      resetProgress(workspaceId, reqContext),
      processCollection.updateOne(
        { _id: getSafeObjectID(processId) },
        {
          $set: {
            state: ProcessState.PROCESSING
          }
        }
      )
    ]);

    Log.info(`Started calculation ${processId}`);

    checkForCanceledProcess(processId, reqContext).catch(() =>
      updateFinishedProcess(
        processId,
        workspaceId,
        ProcessState.CANCELED,
        reqContext
      )
    );

    const results = await Promise.all(
      outputNodes.map(o => executeOutputNode(o, processId, reqContext))
    );

    const durationMs = new Date().getTime() - start;

    await saveResults(results, workspaceId, reqContext);
    await updateFinishedProcess(
      processId,
      workspaceId,
      ProcessState.SUCCESSFUL,
      reqContext,
      durationMs
    );
  } catch (err) {
    console.error(err);
    Raven.captureException(err);
    await updateFinishedProcess(
      processId,
      workspaceId,
      ProcessState.ERROR,
      reqContext
    );
  }
};

const getOutputNodes = (nodes: Array<NodeInstance>) =>
  nodes.filter(
    n =>
      hasNodeType(n.type) ? getNodeType(n.type)!.isOutputNode === true : false
  );

const checkForCanceledProcess = (
  processId: string,
  reqContext: ApolloContext
) =>
  new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      const process = await getCalculation(processId, reqContext);
      if (
        !process ||
        process.state === ProcessState.ERROR ||
        process.state === ProcessState.SUCCESSFUL
      ) {
        clearInterval(timer);
        resolve();
        return;
      }

      if (process.state === ProcessState.CANCELED) {
        clearInterval(timer);
        reject(new Error('Process canceled'));
      }
    }, CANCEL_CHECKS_MS);
  });

const saveResults = async (
  results: Array<NodeOutputResult | null>,
  workspaceId: string,
  reqContext: ApolloContext
) =>
  Promise.all(
    results
      .filter(r => r != null && Object.keys(r).length > 0)
      .map(r => addOrUpdateResult(r!, workspaceId, reqContext))
  );

const executeOutputNode = async (
  o: NodeInstance,
  processId: string,
  reqContext: ApolloContext
): Promise<NodeOutputResult<any> | null> => {
  const res = await executeNode(o, processId, reqContext, {});
  return res.results || null;
};

const updateFinishedProcess = async (
  processId: string,
  workspaceId: string,
  state: ProcessState,
  reqContext: ApolloContext,
  durationMs?: number
) => {
  const processCollection = getCalculationsCollection(reqContext.db);
  await processCollection.updateOne(
    { _id: getSafeObjectID(processId) },
    {
      $set: {
        finish: new Date(),
        state
      }
    }
  );
  Log.info(
    `Finished calculation ${processId} with state ${state}${
      durationMs ? ` in ${durationMs / 1000}s` : ''
    }`
  );

  await clearGeneratedDatasets(workspaceId, reqContext);
};

const getCalculationsCollection = <T = CalculationProcess & { _id: ObjectID }>(
  db: Db
) => db.collection<T>('Calculations');

export const stopCalculation = async (
  id: string,
  reqContext: ApolloContext
): Promise<boolean> => {
  const coll = getCalculationsCollection(reqContext.db);
  const res = await coll.updateOne(
    { _id: getSafeObjectID(id) },
    {
      $set: {
        state: ProcessState.CANCELED
      }
    }
  );

  if (res.modifiedCount !== 1) {
    throw new Error('Process update failed');
  }

  Log.info(`Stop of calculation ${id} initiated`);

  return true;
};

const getCalculation = async (
  id: string,
  reqContext: ApolloContext
): Promise<CalculationProcess | null> => {
  const coll = getCalculationsCollection(reqContext.db);
  const res = await coll.findOne({ _id: getSafeObjectID(id) });
  if (!res) {
    return null;
  }

  const { _id, ...obj } = res;

  return {
    id: _id.toHexString(),
    ...obj
  };
};

export const tryGetCalculation = async (
  id: string,
  reqContext: ApolloContext
) => {
  const calculation = await getCalculation(id, reqContext);
  if (!calculation) {
    throw new Error('Unknown calculation');
  }

  return calculation;
};

export const getAllCalculations = async (
  workspaceId: string,
  reqContext: ApolloContext
): Promise<Array<CalculationProcess>> => {
  const collection = getCalculationsCollection(reqContext.db);
  const all = await collection
    .find({ workspaceId, userId: reqContext.userId })
    .toArray();
  return all.map(c => ({
    id: c._id.toHexString(),
    ...c
  }));
};
