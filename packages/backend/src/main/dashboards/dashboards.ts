import { Dashboard } from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

export const getDashboardCollection = (
  db: Db
): Collection<Dashboard & { _id: ObjectID }> => {
  return db.collection('Dashboards');
};

export const createDashboard = async (
  db: Db,
  name: string
): Promise<Dashboard> => {
  const collection = getDashboardCollection(db);
  if (name.length === 0) {
    throw new Error('Name must not be empty.');
  }

  const existingDbWithSameName = await collection.findOne({ name });
  if (existingDbWithSameName) {
    throw new Error('Names must be unique.');
  }

  const res = await collection.insertOne({
    name,
    type: null
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing dashboard failed');
  }

  const newItem = res.ops[0];
  return {
    id: newItem._id.toHexString(),
    ...newItem
  };
};

export const deleteDashboard = async (db: Db, id: string) => {
  const coll = getDashboardCollection(db);
  const res = await coll.deleteOne({ _id: new ObjectID(id) });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Dashboard failed.');
  }

  return true;
};

export const getAllDashboards = async (db: Db): Promise<Array<Dashboard>> => {
  const collection = getDashboardCollection(db);
  const allDbs = await collection.find().toArray();
  return allDbs.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};

export const getDashboard = async (
  db: Db,
  id: string
): Promise<(Dashboard & { _id: ObjectID }) | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getDashboardCollection(db);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  return {
    id: obj._id.toHexString(),
    ...obj
  };
};
