import { MongoClient, ObjectID, Db } from 'mongodb';

import { Valueschema, dataset } from './dataset';
import { parse } from 'graphql';

export interface Entry {
  id: string;
  values: Array<Value>;
}

export interface Value {
  name: string;
  val: string;
}

export const getEntryCollection = (db: Db, datasetId: ObjectID) => {
  return db.collection(`Entries_${datasetId.toHexString()}`);
};

export const entry = async (
  db: Db,
  datasetId: ObjectID,
  id: ObjectID
): Promise<Entry> => {
  const collection = getEntryCollection(db, datasetId);
  const obj = await collection.findOne({ _id: id });
  if (!obj) {
    throw new Error('Dataset not found!');
  }
  return {
    id: obj._id,
    ...obj
  };
};

export const entriesCount = async (
  db: Db,
  datasetId: ObjectID
): Promise<number> => {
  const collection = getEntryCollection(db, datasetId);
  return await collection.count({});
};

export const latestEntries = async (
  db: Db,
  datasetId: ObjectID
): Promise<Array<Entry>> => {
  const collection = getEntryCollection(db, datasetId);
  // TODO Introduce pagination later
  const entries = await collection
    .find({})
    .limit(20)
    .toArray();
  return entries.map(e => ({
    id: e._id,
    ...e
  }));
};

export const createEntry = async (
  db: Db,
  datasetId: ObjectID,
  values: Array<Value>
) => {
  if (!values.length) {
    throw new Error('No values specified for entry.');
  }

  values.forEach(v => {
    if (v.name === undefined || v.val === undefined) {
      throw new Error(`Value "${v.name}" malformed.`);
    }

    if (Object.keys(v).length !== 2) {
      throw new Error('Other keys then "val" or "name" provided.');
    }
  });

  const dsCollection = await dataset(db, datasetId);

  // check required schemas which are not set
  const missedSchemas = dsCollection.valueschemas
    .filter(s => s.required)
    .filter(s => !values.map(v => v.name).includes(s.name));
  if (missedSchemas.length > 0) {
    throw new Error(`${missedSchemas.map(s => s.name).join(', ')} not set!`);
  }

  // check values which are not specified in the schema
  const allValueNames = dsCollection.valueschemas.map(v => v.name);
  const deliveredValueNames = values.map(v => v.name);
  const unsupportedValues = values.filter(v => !allValueNames.includes(v.name));
  if (unsupportedValues.length > 0) {
    throw new Error(
      `${unsupportedValues.map(v => v.name).join(', ')} not supported!`
    );
  }

  const collection = getEntryCollection(db, datasetId);
  const res = await collection.insertOne({
    values
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing dataset failed');
  }

  const newItem = res.ops[0];
  return {
    id: newItem._id,
    ...newItem
  };
};

export const createEntryFromJSON = async (
  db: Db,
  datasetId: ObjectID,
  values: string
): Promise<Entry> => {
  const parsedValues: Array<Value> = JSON.parse(values);
  return await createEntry(db, datasetId, parsedValues);
};

export const deleteEntry = async (
  db: Db,
  datasetId: ObjectID,
  entryId: ObjectID
) => {
  const collection = getEntryCollection(db, datasetId);
  const res = await collection.deleteOne({ _id: entryId });
  return res.deletedCount === 1;
};
