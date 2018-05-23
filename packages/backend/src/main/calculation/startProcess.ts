import { Db, ObjectID, Collection } from 'mongodb';
import { outputNodes } from '../nodes/AllNodes';
import { ProcessState, CalculationProcess } from '@masterthesis/shared';
import { executeNode } from '../calculation/executeNode';
import { getAllNodes } from '../workspace/nodes';

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
          state: ProcessState.PROCESSING
        }
      }
    );

    await Promise.all(
      outputs.map(async o => {
        await executeNode(db, o);
        // TODO process res
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
          state: ProcessState.SUCCESSFUL
        }
      }
    );
  } catch (err) {
    await processCollection.updateOne(
      { _id: new ObjectID(processId) },
      {
        $set: {
          finish: new Date(),
          state: ProcessState.ERROR
        }
      }
    );
    if (process.env.NODE_ENV !== 'test') {
      console.error('Finished calculation with errors.', err);
    }
  }
};

export const getCalculationsCollection = (
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
