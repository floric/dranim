import { ApolloContext, OutputResult } from '@masterthesis/shared';

import { Collection, Db, ObjectID } from 'mongodb';
import { tryGetWorkspace } from '../workspace/workspace';

export const getResultsCollection = (
  db: Db
): Collection<OutputResult & { _id: ObjectID; id: string }> => {
  return db.collection('Results');
};

export const addOrUpdateResult = async (
  result: OutputResult,
  reqContext: ApolloContext
): Promise<OutputResult & { id: string }> => {
  const { name, workspaceId } = result;
  const collection = getResultsCollection(reqContext.db);
  await validateInputs(result, reqContext);

  const existing = await collection.findOne({ name, workspaceId });

  let safedRes: OutputResult & { _id: ObjectID };
  if (existing) {
    safedRes = await updateResult(result, reqContext);
  } else {
    safedRes = await createResult(result, reqContext);
  }

  const { _id, ...rest } = safedRes;
  return { ...rest, id: _id.toHexString() };
};

const createResult = async (
  result: OutputResult,
  reqContext: ApolloContext
) => {
  const { name, type, value, workspaceId, description } = result;
  const coll = getResultsCollection(reqContext.db);
  const res = await coll.insertOne({
    name,
    type,
    description,
    value: JSON.stringify(value),
    workspaceId
  });

  if (res.insertedCount !== 1) {
    throw new Error('Writing result failed');
  }

  return res.ops[0];
};

const updateResult = async (
  result: OutputResult,
  reqContext: ApolloContext
) => {
  const { name, type, value, workspaceId, description } = result;
  const coll = getResultsCollection(reqContext.db);
  const res = await coll.findOneAndUpdate(
    { name, workspaceId },
    {
      $set: {
        name,
        type,
        description,
        value: JSON.stringify(value),
        workspaceId
      }
    }
  );

  if (res.ok !== 1 || !res.value) {
    throw new Error('Writing result failed');
  }

  return res.value;
};

const validateInputs = async (
  result: OutputResult,
  reqContext: ApolloContext
) => {
  if (result.name.length === 0) {
    throw new Error('Name must not be empty');
  }

  await tryGetWorkspace(result.workspaceId, reqContext);
};

export const deleteResultById = async (
  id: string,
  reqContext: ApolloContext
) => {
  const coll = getResultsCollection(reqContext.db);
  const res = await coll.deleteOne({ _id: new ObjectID(id) });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Result failed');
  }

  return true;
};

export const deleteResultByName = async (
  name: string,
  workspaceId: string,
  reqContext: ApolloContext
) => {
  const coll = getResultsCollection(reqContext.db);
  const res = await coll.deleteOne({ name, workspaceId });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Result failed');
  }

  return true;
};

export const deleteResultsByWorkspace = async (
  workspaceId: string,
  reqContext: ApolloContext
) => {
  const coll = getResultsCollection(reqContext.db);
  const res = await coll.deleteMany({ workspaceId });
  if (res.result.ok !== 1) {
    throw new Error('Deletion of Result failed');
  }

  return true;
};

export const getResultsForWorkspace = async (
  workspaceId: string,
  reqContext: ApolloContext
): Promise<Array<OutputResult & { id: string }>> => {
  const all = await getResultsCollection(reqContext.db)
    .find({ workspaceId })
    .toArray();

  return all.map(n => {
    const { _id, ...rest } = n;
    return { ...rest, id: _id.toHexString() };
  });
};

export const getResult = async (
  id: string,
  reqContext: ApolloContext
): Promise<(OutputResult & { id: string }) | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getResultsCollection(reqContext.db);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  const { _id, ...rest } = obj;
  return { ...rest, id: _id.toHexString() };
};
