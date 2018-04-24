import { MongoClient, ObjectID, Db } from 'mongodb';

export interface Valueschema {
  name: string;
  type: 'String' | 'Boolean' | 'Date' | 'Number';
  required: boolean;
  fallback: string;
}

export interface Dataset {
  id: string;
  name: string;
  valueschemas: Array<Valueschema>;
  entries: Array<number>;
}

const getDatasetsCollection = (db: Db) => {
  return db.collection('Datasets');
};

export const createDataset = async (db: Db, name: string): Promise<Dataset> => {
  const collection = getDatasetsCollection(db);
  if (name.length === 0) {
    throw new Error("Name mustn't be empty.");
  }

  const existingDatasetsWithSameName = await collection.findOne({ name });
  if (existingDatasetsWithSameName) {
    throw new Error('Names must be unique.');
  }

  const res = await collection.insertOne({
    name,
    valueschemas: []
  });

  if (res.result.ok !== 1) {
    throw new Error('Writing dataset failed');
  }

  return dataset(db, res.insertedId);
};

export const deleteDataset = async (db: Db, id: ObjectID) => {
  const collection = getDatasetsCollection(db);
  const res = await collection.deleteOne({ _id: id });
  return res.deletedCount === 1;
};

export const datasets = async (db: Db): Promise<Array<Dataset>> => {
  const collection = getDatasetsCollection(db);
  const allDatasets = await collection.find({}).toArray();
  return allDatasets.map(ds => ({
    id: ds._id,
    ...ds
  }));
};

export const dataset = async (db: Db, id: ObjectID): Promise<Dataset> => {
  const collection = getDatasetsCollection(db);
  const obj = await collection.findOne({ _id: id });
  if (!obj) {
    throw new Error('Dataset not found!');
  }
  return {
    id: obj._id,
    ...obj
  };
};

export const addValueSchema = async (
  db: Db,
  datasetId: ObjectID,
  schema: Valueschema
): Promise<boolean> => {
  const collection = getDatasetsCollection(db);
  const ds = await dataset(db, datasetId);

  if (schema.name.length === 0) {
    throw new Error("Name mustn't be empty.");
  }

  if (ds.valueschemas.find(s => s.name === schema.name)) {
    throw new Error('Schema already exists.');
  }

  ds.valueschemas.push(schema);

  const res = await collection.updateOne(
    { _id: datasetId },
    {
      $set: { valueschemas: ds.valueschemas }
    },
    {
      upsert: false
    }
  );

  return res.modifiedCount === 1;
};
