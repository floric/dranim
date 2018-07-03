import { ApolloContext, Dataset, DataType } from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { clearEntries, getEntryCollection } from './entry';

export interface Valueschema {
  name: string;
  type: DataType;
  required: boolean;
  fallback: string;
  unique: boolean;
}

export const getDatasetsCollection = (
  db: Db
): Collection<Dataset & { _id: ObjectID }> => {
  return db.collection('Datasets');
};

export const createDataset = async (
  name: string,
  reqContext: ApolloContext,
  workspaceId: string | null = null
): Promise<Dataset> => {
  const collection = getDatasetsCollection(reqContext.db);
  if (name.length === 0) {
    throw new Error('Name must not be empty');
  }

  const existingDatasetsWithSameName = await collection.findOne({
    name,
    userId: reqContext.userId
  });
  if (existingDatasetsWithSameName) {
    throw new Error('Names must be unique');
  }

  const res = await collection.insertOne({
    name,
    userId: reqContext.userId,
    valueschemas: [],
    workspaceId
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing dataset failed');
  }

  const { _id, ...obj } = res.ops[0];
  return {
    id: _id.toHexString(),
    ...obj
  };
};

export const deleteDataset = async (id: string, reqContext: ApolloContext) => {
  await clearEntries(id, reqContext);
  const collection = getDatasetsCollection(reqContext.db);
  const res = await collection.deleteOne({ _id: new ObjectID(id) });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Dataset failed');
  }

  return true;
};

export const getAllDatasets = async (
  reqContext: ApolloContext
): Promise<Array<Dataset>> => {
  const collection = getDatasetsCollection(reqContext.db);
  const allDatasets = await collection
    .find({ userId: reqContext.userId })
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
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getDatasetsCollection(reqContext.db);
  const res = await collection.findOne({ _id: new ObjectID(id) });
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

export const addValueSchema = async (
  datasetId: string,
  schema: Valueschema,
  reqContext: ApolloContext
): Promise<boolean> => {
  const collection = getDatasetsCollection(reqContext.db);
  const ds = await getDataset(datasetId, reqContext);
  if (!ds) {
    throw new Error('Dataset not found');
  }

  if (schema.name.length === 0) {
    throw new Error('Name must not be empty');
  }

  if (ds.valueschemas.find(s => s.name === schema.name)) {
    throw new Error('Schema already exists');
  }

  const res = await collection.updateOne(
    { _id: new ObjectID(datasetId) },
    {
      $push: { valueschemas: schema }
    },
    {
      upsert: false
    }
  );

  // create unique index for identifiers
  if (schema.type === 'String' && schema.unique) {
    const entryCollection = getEntryCollection(datasetId, reqContext.db);
    await entryCollection.createIndex(`values.${schema.name}`, {
      unique: true
    });
  }

  return res.modifiedCount === 1;
};

export const clearGeneratedDatasets = async (
  wsId: string,
  reqContext: ApolloContext
) => {
  const coll = getDatasetsCollection(reqContext.db);
  await coll.deleteMany({ workspaceId: wsId });
};
