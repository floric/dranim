import { Dataset, DataType } from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { getEntryCollection } from './entry';

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

export const createDataset = async (db: Db, name: string): Promise<Dataset> => {
  const collection = getDatasetsCollection(db);
  if (name.length === 0) {
    throw new Error('Name must not be empty.');
  }

  const existingDatasetsWithSameName = await collection.findOne({ name });
  if (existingDatasetsWithSameName) {
    throw new Error('Names must be unique.');
  }

  const res = await collection.insertOne({
    name,
    valueschemas: []
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

export const deleteDataset = async (db: Db, id: string) => {
  const entryCollection = getEntryCollection(db, id);
  const containedEntries = await entryCollection.count({});
  if (containedEntries > 0) {
    await entryCollection.drop();
  }

  const collection = getDatasetsCollection(db);
  const res = await collection.deleteOne({ _id: new ObjectID(id) });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Dataset failed.');
  }

  return true;
};

export const getAllDatasets = async (db: Db): Promise<Array<Dataset>> => {
  const collection = getDatasetsCollection(db);
  const allDatasets = await collection.find().toArray();
  return allDatasets.map(ds => {
    const { _id, ...obj } = ds;
    return {
      id: _id.toHexString(),
      ...obj
    };
  });
};

export const getDataset = async (
  db: Db,
  id: string
): Promise<Dataset | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getDatasetsCollection(db);
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

export const addValueSchema = async (
  db: Db,
  datasetId: string,
  schema: Valueschema
): Promise<boolean> => {
  const collection = getDatasetsCollection(db);
  const ds = await getDataset(db, datasetId);
  if (!ds) {
    throw new Error('Dataset not found.');
  }

  if (schema.name.length === 0) {
    throw new Error('Name must not be empty.');
  }

  if (ds.valueschemas.find(s => s.name === schema.name)) {
    throw new Error('Schema already exists.');
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
    const entryCollection = getEntryCollection(db, datasetId);
    await entryCollection.createIndex(`values.${schema.name}`, {
      unique: true
    });
  }

  return res.modifiedCount === 1;
};
