import {
  ApolloContext,
  Dataset,
  DataType,
  ValueSchema
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import { UserInputError } from 'apollo-server-core';
import { Log } from '../../logging';
import { Omit } from '../../main';
import { checkLoggedInUser } from '../users/management';
import { getSafeObjectID } from '../utils';
import { clearEntries, getEntryCollection } from './entry';

export const getDatasetsCollection = <T = Dataset & { _id: ObjectID }>(
  db: Db
) => db.collection<T>('Datasets');

export const createDataset = async (
  name: string,
  reqContext: ApolloContext,
  workspaceId: string | null = null
): Promise<Dataset> => {
  checkLoggedInUser(reqContext);

  const collection = getDatasetsCollection<
    Omit<Dataset, 'id' | 'created'> & { created: Date }
  >(reqContext.db);
  if (name.length === 0) {
    throw new Error('Name must not be empty');
  }

  const res = await collection.insertOne({
    name: name.trim(),
    userId: reqContext.userId!,
    valueschemas: [],
    workspaceId,
    description: '',
    created: new Date()
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing dataset failed');
  }

  const { _id, ...obj } = res.ops[0];
  if (!workspaceId) {
    Log.info(`Dataset ${_id.toHexString()} created`);
  }

  return {
    id: _id.toHexString(),
    ...obj
  };
};

export const deleteDataset = async (id: string, reqContext: ApolloContext) => {
  const ds = await getDataset(id, reqContext);
  if (!ds) {
    return false;
  }

  await clearEntries(id, reqContext);

  const collection = getDatasetsCollection(reqContext.db);
  const res = await collection.deleteOne({
    _id: getSafeObjectID(id),
    userId: reqContext.userId
  });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Dataset failed');
  }

  return true;
};

export const getAllDatasets = async (
  reqContext: ApolloContext
): Promise<Array<Dataset>> => {
  checkLoggedInUser(reqContext);

  const collection = getDatasetsCollection(reqContext.db);
  const allDatasets = await collection
    .find({ userId: reqContext.userId, workspaceId: null })
    .toArray();
  return allDatasets.map(ds => {
    const { _id, ...obj } = ds;
    return {
      id: _id.toHexString(),
      ...obj
    };
  });
};

export const getDataset = async (
  id: string,
  reqContext: ApolloContext
): Promise<Dataset | null> => {
  const collection = getDatasetsCollection(reqContext.db);
  const res = await collection.findOne({
    _id: getSafeObjectID(id),
    userId: reqContext.userId
  });
  if (!res) {
    return null;
  }

  const { _id, ...obj } = res;
  return {
    id: _id.toHexString(),
    ...obj
  };
};

export const tryGetDataset = async (id: string, reqContext: ApolloContext) => {
  const ds = await getDataset(id, reqContext);
  if (!ds) {
    throw new Error('Unknown dataset');
  }

  return ds;
};

export const renameDataset = async (
  id: string,
  name: string,
  reqContext: ApolloContext
) => {
  if (name.length === 0) {
    throw new Error('Name must not be empty.');
  }

  const ds = await tryGetDataset(id, reqContext);
  const collection = getDatasetsCollection(reqContext.db);
  const res = await collection.updateOne(
    { _id: getSafeObjectID(ds.id) },
    { $set: { name: name.trim() } }
  );

  if (res.modifiedCount !== 1) {
    throw new Error('Updating the name has failed.');
  }

  return true;
};

export const addValueSchema = async (
  datasetId: string,
  schema: ValueSchema,
  reqContext: ApolloContext
): Promise<boolean> => {
  const collection = getDatasetsCollection(reqContext.db);
  const ds = await tryGetDataset(datasetId, reqContext);
  if (schema.name.length === 0) {
    throw new UserInputError('Name must not be empty');
  }

  if (ds.valueschemas.find(s => s.name === schema.name)) {
    throw new UserInputError('Field with this name already exists.');
  }

  const res = await collection.updateOne(
    { _id: getSafeObjectID(datasetId) },
    {
      $push: { valueschemas: schema }
    },
    {
      upsert: false
    }
  );

  // create unique index for identifiers
  if (schema.type === DataType.STRING && schema.unique) {
    const entryCollection = getEntryCollection(datasetId, reqContext.db);
    await entryCollection.createIndex(`values.${schema.name}`, {
      unique: true,
      background: true
    });
  }

  return res.modifiedCount === 1;
};

export const clearGeneratedDatasets = async (
  wsId: string,
  reqContext: ApolloContext
) => {
  const coll = getDatasetsCollection(reqContext.db);
  const existingDsCursor = coll.find({ workspaceId: wsId });
  while (await (existingDsCursor as any).hasNext()) {
    const doc = await existingDsCursor.next();
    await deleteDataset(doc!._id.toHexString(), reqContext);
  }

  Log.info(`Cleared temporary datasets including entries.`);
};
