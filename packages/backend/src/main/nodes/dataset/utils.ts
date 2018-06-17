import { Db } from 'mongodb';

import { getDataset } from '../../../main/workspace/dataset';

export const validateDataset = async (id: string, db: Db) => {
  const ds = await getDataset(db, id);
  if (!ds) {
    throw new Error('Unknown dataset');
  }
};
