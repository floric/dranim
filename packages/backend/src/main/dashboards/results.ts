import {
  ApolloContext,
  NodeOutputResult,
  OutputResult
} from '@masterthesis/shared';

import { Db, ObjectID } from 'mongodb';
import { Omit } from '../../main';
import { tryGetWorkspace } from '../workspace/workspace';

export const getResultsCollection = <T = OutputResult & { _id: ObjectID }>(
  db: Db
) => db.collection<T>('Results');

export const addOrUpdateResult = async (
  result: NodeOutputResult,
  workspaceId: string,
  reqContext: ApolloContext
): Promise<OutputResult> => {
  const { name } = result;
  const collection = getResultsCollection(reqContext.db);
  await validateResult(result, workspaceId, reqContext);

  const existing = await collection.findOne({
    name,
    workspaceId
  });

  if (existing) {
    const { _id: skipId, ...unchanged } = existing;
    return await updateResult(
      {
        ...unchanged,
        type: result.type,
        value: result.value,
        description: result.description
      },
      reqContext
    );
  }

  return await createResult(result, workspaceId, reqContext);
};

export const setResultVisibility = async (
  id: string,
  visible: boolean,
  reqContext: ApolloContext
) => {
  const result = await tryGetResult(id, reqContext);
  return await updateResult({ ...result, visible }, reqContext);
};

const createResult = async (
  result: NodeOutputResult,
  workspaceId: string,
  reqContext: ApolloContext
) => {
  const { name, type, value, description } = result;
  const coll = getResultsCollection<Omit<OutputResult, 'id'>>(reqContext.db);
  const res = await coll.insertOne({
    name,
    type,
    description,
    userId: reqContext.userId,
    value,
    visible: false,
    workspaceId
  });

  if (res.insertedCount !== 1) {
    throw new Error('Writing result failed');
  }

  const { _id, ...rest } = res.ops[0];
  return { ...rest, id: _id.toHexString() };
};

const updateResult = async (
  result: OutputResult,
  reqContext: ApolloContext
) => {
  const {
    name,
    workspaceId,
    value,
    type,
    description,
    userId,
    visible
  } = result;
  const coll = getResultsCollection(reqContext.db);
  const res = await coll.findOneAndUpdate(
    { name, workspaceId, userId },
    {
      $set: {
        value,
        type,
        description,
        visible
      }
    }
  );

  if (res.ok !== 1 || !res.value) {
    throw new Error('Writing result failed');
  }

  return result;
};

const validateResult = async (
  result: NodeOutputResult,
  workspaceId: string,
  reqContext: ApolloContext
) => {
  if (result.name.length === 0) {
    throw new Error('Name must not be empty');
  }

  await tryGetWorkspace(workspaceId, reqContext);
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
  const res = await coll.deleteMany({ workspaceId, userId: reqContext.userId });
  if (res.result.ok !== 1) {
    throw new Error('Deletion of Result failed');
  }

  return true;
};

export const getResultsForWorkspace = async (
  workspaceId: string,
  reqContext: ApolloContext
): Promise<Array<OutputResult>> => {
  const all = await getResultsCollection(reqContext.db)
    .find({ workspaceId, userId: reqContext.userId })
    .toArray();

  return all.map(n => {
    const { _id, ...rest } = n;
    return { ...rest, id: _id.toHexString() };
  });
};

export const getResult = async (
  id: string,
  reqContext: ApolloContext
): Promise<OutputResult | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getResultsCollection(reqContext.db);
  const obj = await collection.findOne({
    _id: new ObjectID(id),
    userId: reqContext.userId
  });
  if (!obj) {
    return null;
  }

  const { _id, ...rest } = obj;
  return { ...rest, id: _id.toHexString() };
};

export const tryGetResult = async (id: string, reqContext: ApolloContext) => {
  const res = await getResult(id, reqContext);
  if (!res) {
    throw new Error('Unknown Result');
  }

  return res;
};
