import { ApolloContext, Dataset, Entry, Values } from '@masterthesis/shared';
import { Collection, Db, ObjectID } from 'mongodb';

import { tryGetDataset } from './dataset';
import { UploadEntryError } from './upload';

export const getEntryCollection = (
  datasetId: string,
  db: Db
): Collection<Entry & { _id: ObjectID }> =>
  db.collection(`Entries_${datasetId}`);

export const getEntry = async (
  datasetId: string,
  id: string,
  reqContext: ApolloContext
): Promise<Entry | null> => {
  const collection = getEntryCollection(datasetId, reqContext.db);
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

interface GetEntriesCountOptions {
  estimate?: boolean;
}

export const getEntriesCount = async (
  datasetId: string,
  reqContext: ApolloContext,
  options?: GetEntriesCountOptions
): Promise<number> => {
  const collection = getEntryCollection(datasetId, reqContext.db);
  if (options && options.estimate) {
    return await collection.estimatedDocumentCount();
  }

  return await collection.countDocuments();
};

export const clearEntries = async (
  datasetId: string,
  reqContext: ApolloContext
) => {
  const count = await getEntriesCount(datasetId, reqContext);
  if (count > 0) {
    const entryCollection = getEntryCollection(datasetId, reqContext.db);
    await entryCollection.drop();
  }
};

export interface LatestEntriesOptions {
  count?: number;
}

export const getLatestEntries = async (
  datasetId: string,
  reqContext: ApolloContext,
  options?: LatestEntriesOptions
): Promise<Array<Entry>> => {
  const collection = getEntryCollection(datasetId, reqContext.db);
  // TODO Introduce pagination later
  const entries = await collection
    .find()
    .limit(options && options.count ? options.count : 100)
    .toArray();
  return entries.map(e => ({
    id: e._id.toHexString(),
    ...e
  }));
};

export interface CreateEntryOptions {
  skipSchemaValidation?: boolean;
}

export const createEntry = async (
  datasetId: string,
  values: Values,
  reqContext: ApolloContext,
  options?: CreateEntryOptions
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

  const ds = await tryGetDataset(datasetId, reqContext);
  if (!options || !options.skipSchemaValidation) {
    await checkForMissingValues(ds, valuesArr.map(v => v[0]));
    await checkForUnsupportedValues(ds, valuesArr.map(v => v[0]));
  }

  try {
    const collection = getEntryCollection(ds.id, reqContext.db);
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

export const createEntryFromJSON = async (
  datasetId: string,
  values: string,
  reqContext: ApolloContext,
  options?: CreateEntryOptions
): Promise<Entry> => {
  const parsedValues: Values = JSON.parse(values);
  return await createEntry(datasetId, parsedValues, reqContext, options);
};

export const deleteEntry = async (
  datasetId: string,
  entryId: string,
  reqContext: ApolloContext
) => {
  if (!ObjectID.isValid(entryId) || !ObjectID.isValid(datasetId)) {
    throw new Error('Invalid ID');
  }

  const collection = getEntryCollection(datasetId, reqContext.db);
  const res = await collection.deleteOne({ _id: new ObjectID(entryId) });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting entry failed');
  }

  return true;
};
