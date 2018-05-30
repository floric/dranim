import { Db } from 'mongodb';

import { getDataset } from '../../../main/workspace/dataset';

export const validateDataset = async (id: string, db: Db) => {
  const ds = await getDataset(db, id);
  if (!ds) {
    throw new Error('Unknown dataset');
  }
};
export const validateDatasetId = (value: { id: string } | null) => {
  if (!value || !value.id) {
    return false;
  }

  return true;
};
