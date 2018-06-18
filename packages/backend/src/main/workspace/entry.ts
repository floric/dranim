import { Dataset, Entry, Values } from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { UploadEntryError } from './upload';
import { getDataset } from './dataset';

export const getEntryCollection = (
  db: Db,
  datasetId: string
): Collection<Entry & { _id: ObjectID }> => {
  return db.collection(`Entries_${datasetId}`);
};

export const getEntry = async (
  db: Db,
  datasetId: string,
  id: string
): Promise<Entry | null> => {
  const collection = getEntryCollection(db, datasetId);
  const obj = await collection.findOne({ _id: new ObjectID(id) });
  if (!obj) {
    return null;
  }

  const { _id, ...res } = obj;
  return {
    id: _id.toHexString(),
    ...res
  };
};

export const getAllEntries = async (
  db: Db,
  datasetId: string
): Promise<Array<Entry>> => {
  const collection = getEntryCollection(db, datasetId);
  return await collection.find().toArray();
};

export const getEntriesCount = async (
  db: Db,
  datasetId: string
): Promise<number> => {
  const collection = getEntryCollection(db, datasetId);
  return await collection.count({});
};

export const clearEntries = async (db, datasetId: string) => {
  const count = await getEntriesCount(db, datasetId);
  if (count > 0) {
    const entryCollection = getEntryCollection(db, datasetId);
    await entryCollection.drop();
  }
};

export const getLatestEntries = async (
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
  values: Values
): Promise<Entry> => {
  const valuesArr = Array.from(Object.entries(values));

  if (valuesArr.length === 0) {
    throw new UploadEntryError('No values specified for entry.', 'no-values');
  }

  valuesArr.forEach(v => {
    if (!v || v[0] == null || v[1] == null) {
      throw new Error('Value malformed');
    }
  });

  const ds = await getDataset(db, datasetId);
  if (!ds) {
    throw new Error('Invalid dataset');
  }

  await checkForMissingValues(ds, valuesArr.map(v => v[0]));
  await checkForUnsupportedValues(ds, valuesArr.map(v => v[0]));

  try {
    const collection = getEntryCollection(db, ds.id);
    const res = await collection.insertOne({
      values
    });

    if (res.result.ok !== 1 || res.ops.length !== 1) {
      throw new Error('Writing dataset failed');
    }

    const obj = res.ops[0];
    const { _id, ...other } = obj;
    return {
      id: _id.toHexString(),
      ...other
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

const checkForMissingValues = async (
  ds: Dataset,
  valueNames: Array<string>
) => {
  const missedSchemas = ds.valueschemas
    .filter(s => s.required)
    .filter(s => !valueNames.includes(s.name));
  if (missedSchemas.length > 0) {
    throw new UploadEntryError(
      'Values from Schema not set',
      'schema-not-fulfilled'
    );
  }
};

const checkForUnsupportedValues = async (
  ds: Dataset,
  valueNames: Array<string>
) => {
  const allValueNames = ds.valueschemas.map(v => v.name);
  const unsupportedValues = valueNames.filter(v => !allValueNames.includes(v));
  if (unsupportedValues.length > 0) {
    throw new UploadEntryError(
      'Unsupported values provided',
      'unsupported-values'
    );
  }
};

export const copyTransformedToOtherDataset = async (
  db: Db,
  oldDsId: string,
  newDsId: string,
  transformFn: (obj: Entry) => Values
) => {
  const newDs = await getDataset(db, newDsId);
  if (!newDs) {
    throw new Error('Invalid dataset');
  }

  const oldCollection = getEntryCollection(db, oldDsId);
  const cursor = oldCollection.find();
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const newValues = transformFn(doc);
    await createEntry(db, newDs.id, newValues);
  }
};

export const createEntryFromJSON = async (
  db: Db,
  datasetId: string,
  values: string
): Promise<Entry> => {
  const parsedValues: Values = JSON.parse(values);
  const ds = await getDataset(db, datasetId);
  if (!ds) {
    throw new Error('Invalid dataset');
  }

  return await createEntry(db, ds.id, parsedValues);
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
