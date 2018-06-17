import { IOValues, DatasetRef } from '@masterthesis/shared';

import { getDataset } from '../workspace/dataset';
import { Db } from 'mongodb';

export const isInputValid = async (input: any, db: Db) => {
  if (isDatasetRef(input)) {
    return await validateDataset(input, db);
  }

  return true;
};

const isDatasetRef = (input: any): input is DatasetRef => {
  return input.datasetId !== undefined;
};

const validateDataset = async (
  datasetRef: DatasetRef,
  db: Db
): Promise<boolean> => {
  const ds = await getDataset(db, datasetRef.datasetId);
  if (!ds) {
    return false;
  }

  return true;
};

export const areInputsValid = async (
  inputs: IOValues<any>,
  db: Db
): Promise<boolean> => {
  const res = await Promise.all(
    Object.values(inputs).map(p => isInputValid(p, db))
  );
  return res.reduce((a, b) => a && b, true);
};
