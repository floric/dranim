import { Visualization } from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { getDataset } from '../workspace/dataset';

export const getVisCollection = (
  db: Db
): Collection<Visualization & { _id: ObjectID }> => {
  return db.collection('Visualizations');
};

export const createVisualization = async (
  db: Db,
  name: string,
  datasetId: string
): Promise<Visualization> => {
  const collection = getVisCollection(db);
  if (name.length === 0) {
    throw new Error('Name must not be empty.');
  }

  const existingVisWithSameName = await collection.findOne({ name });
  if (existingVisWithSameName) {
    throw new Error('Names must be unique.');
  }

  const ds = await getDataset(db, datasetId);
  if (!ds) {
    throw new Error('Unknown dataset');
  }

  const res = await collection.insertOne({
    name,
    datasetId,
    type: null
  });

  if (res.result.ok !== 1 || res.ops.length !== 1) {
    throw new Error('Writing dataset failed');
  }

  const newItem = res.ops[0];
  return {
    id: newItem._id.toHexString(),
    ...newItem
  };
};

export const deleteVisualization = async (db: Db, id: string) => {
  const coll = getVisCollection(db);
  const res = await coll.deleteOne({ _id: new ObjectID(id) });
  if (res.result.ok !== 1 || res.deletedCount !== 1) {
    throw new Error('Deletion of Visualization failed.');
  }

  return true;
};

export const getAllVisualizations = async (
  db: Db
): Promise<Array<Visualization>> => {
  const collection = getVisCollection(db);
  const allDatasets = await collection.find().toArray();
  return allDatasets.map(ds => ({
    id: ds._id.toHexString(),
    ...ds
  }));
};

export const getVisualization = async (
  db: Db,
  id: string
): Promise<(Visualization & { _id: ObjectID }) | null> => {
  if (!ObjectID.isValid(id)) {
    return null;
  }

  const collection = getVisCollection(db);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  return {
    id: obj._id.toHexString(),
    ...obj
  };
};
