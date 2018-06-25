import { OutputResult } from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

export const getResultsCollection = (
  db: Db
): Collection<OutputResult & { _id: ObjectID }> => {
  return db.collection('Results');
};

export const addOrUpdateResult = async (
  result: OutputResult,
  db: Db
): Promise<void> => {
  const collection = getResultsCollection(db);
  const { name, type, value, dashboardId } = result;
  if (name.length === 0) {
    throw new Error('Name must not be empty.');
  }

  const res = await collection.updateOne(
    { name },
    {
      $set: {
        name,
        type,
        value: JSON.stringify(value),
        dashboardId
      }
    },
    { upsert: true }
  );

  if (res.result.ok !== 1) {
    throw new Error('Writing result failed');
  }
};

export const deleteResult = async (db: Db, name: string) => {
  const coll = getResultsCollection(db);
  const res = await coll.deleteOne({ name });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Result failed.');
  }

  return true;
};

export const getResultsForDashboard = async (
  dashboardId: string,
  db: Db
): Promise<Array<OutputResult>> =>
  getResultsCollection(db)
    .find({ dashboardId })
    .toArray();

export const getResult = async (
  db: Db,
  id: string
): Promise<(OutputResult & { _id: ObjectID }) | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getResultsCollection(db);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  return obj;
};
