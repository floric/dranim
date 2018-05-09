import { Db } from 'mongodb';
import { allNodes } from './editor';
import { mongoDbClient } from '../../config/db';

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

  return {
    id: newProcess.ops[0]._id,
    ...newProcess.ops[0]
  };
};
