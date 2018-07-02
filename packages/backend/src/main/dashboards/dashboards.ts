import { ApolloContext, Dashboard } from '@masterthesis/shared';

import { Collection, Db, ObjectID } from 'mongodb';

import { deleteResultsByDashboard } from './results';

export const getDashboardCollection = (
  db: Db
): Collection<Dashboard & { _id: ObjectID }> => {
  return db.collection('Dashboards');
};

export const createDashboard = async (
  name: string,
  reqContext: ApolloContext
): Promise<Dashboard> => {
  const collection = getDashboardCollection(reqContext.db);
  if (name.length === 0) {
    throw new Error('Name must not be empty');
  }

  const existingDbWithSameName = await collection.findOne({ name });
  if (existingDbWithSameName) {
    throw new Error('Names must be unique');
  }

  const res = await collection.insertOne({
    name
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

export const deleteDashboard = async (
  id: string,
  reqContext: ApolloContext
) => {
  const coll = getDashboardCollection(reqContext.db);
  const res = await coll.deleteOne({ _id: new ObjectID(id) });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Dashboard failed.');
  }

  await deleteResultsByDashboard(id, reqContext);

  return true;
};

export const getAllDashboards = async (
  reqContext: ApolloContext
): Promise<Array<Dashboard>> => {
  const collection = getDashboardCollection(reqContext.db);
  const allDbs = await collection.find().toArray();
  return allDbs.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};

export const getDashboard = async (
  id: string,
  reqContext: ApolloContext
): Promise<(Dashboard & { _id: ObjectID }) | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getDashboardCollection(reqContext.db);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  return {
    id: obj._id.toHexString(),
    ...obj
  };
};

export const tryGetDashboard = async (
  id: string,
  reqContext: ApolloContext
): Promise<Dashboard> => {
  const dashboard = await getDashboard(id, reqContext);
  if (!dashboard) {
    throw new Error('Unknown dashboard');
  }

  return dashboard;
};
