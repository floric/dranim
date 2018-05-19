import { ObjectID, Db } from 'mongodb';

import { getDataset } from './dataset';
import { UploadEntryError } from './upload';

export interface Entry {
  id: string;
  values: {
    [name: string]: any;
  };
}

export interface Value {
  name: string;
  val: string;
}

export const getEntryCollection = (db: Db, datasetId: string) => {
  return db.collection(`Entries_${datasetId}`);
};

export const getEntry = async (
  db: Db,
  datasetId: string,
  id: string
): Promise<Entry> => {
  const collection = getEntryCollection(db, datasetId);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    throw new Error('Dataset not found!');
  }
  return {
    id: obj._id.toHexString(),
    ...obj
  };
};

export const entriesCount = async (
  db: Db,
  datasetId: string
): Promise<number> => {
  const collection = getEntryCollection(db, datasetId);
  return await collection.count({});
};

export const latestEntries = async (
  db: Db,
  datasetId: string
): Promise<Array<Entry>> => {
  const collection = getEntryCollection(db, datasetId);
  // TODO Introduce pagination later
  const entries = await collection
    .find()
    .limit(20)
    .toArray();
  return entries.map(e => ({
    id: e._id.toHexString(),
    ...e
  }));
};

export const createEntry = async (
  db: Db,
  datasetId: string,
  valuesArr: Array<Value>
) => {
  if (!valuesArr.length) {
    throw new UploadEntryError('No values specified for entry.', 'no-values');
  }

  valuesArr.forEach(v => {
    if (v.name === undefined || v.val === undefined) {
      throw new Error(`Value "${v.name}" malformed.`);
    }

    if (Object.keys(v).length !== 2) {
      throw new Error('Other keys then "val" or "name" provided.');
    }
  });

  const dsCollection = await getDataset(db, datasetId);

  // check required schemas which are not set
  const missedSchemas = dsCollection.valueschemas
    .filter(s => s.required)
    .filter(s => !valuesArr.map(v => v.name).includes(s.name));
  if (missedSchemas.length > 0) {
    throw new UploadEntryError(
      'Values from Schema not set',
      'schema-not-fulfilled'
    );
  }

  // check values which are not specified in the schema
  const allValueNames = dsCollection.valueschemas.map(v => v.name);
  const unsupportedValues = valuesArr.filter(
    v => !allValueNames.includes(v.name)
  );
  if (unsupportedValues.length > 0) {
    throw new UploadEntryError(
      'Unsupported values provided',
      'unsupported-values'
    );
  }

  const values = {};
  valuesArr.forEach(v => {
    values[v.name] = v.val;
  });

  const collection = getEntryCollection(db, datasetId);
  try {
    const res = await collection.insertOne({
      values
    });

    if (res.result.ok !== 1 || res.ops.length !== 1) {
      throw new Error('Writing dataset failed');
    }

    const newItem = res.ops[0];
    return {
      id: newItem._id.toHexString(),
      ...newItem
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new UploadEntryError('Key already used', 'key-already-used');
    } else {
      throw new UploadEntryError(
        'Writing entry failed.',
        'internal-write-error'
      );
    }
  }
};

export const createEntryFromJSON = async (
  db: Db,
  datasetId: string,
  values: string
): Promise<Entry> => {
  const parsedValues: Array<Value> = JSON.parse(values);
  return await createEntry(db, datasetId, parsedValues);
};

export const deleteEntry = async (
  db: Db,
  datasetId: string,
  entryId: string
) => {
  if (!ObjectID.isValid(entryId) || !ObjectID.isValid(datasetId)) {
    throw new Error('Invalid ID');
  }

  const collection = getEntryCollection(db, datasetId);
  const res = await collection.deleteOne({ _id: new ObjectID(entryId) });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting entry failed');
  }

  return true;
};
