import {
  ApolloContext,
  Dataset,
  DataType,
  Entry,
  Values
} from '@masterthesis/shared';
import { Db, ObjectID } from 'mongodb';

import { Omit } from '../../main';
import { getSafeObjectID } from '../utils';
import { getDataset, tryGetDataset } from './dataset';
import { UploadEntryError } from './upload';

export const getEntryCollection = <T = Entry & { _id: ObjectID }>(
  datasetId: string,
  db: Db
) => db.collection<T>(`Entries_${datasetId}`);

export const getEntry = async (
  datasetId: string,
  id: string,
  reqContext: ApolloContext
): Promise<Entry | null> => {
  const collection = getEntryCollection(datasetId, reqContext.db);
  const obj = await collection.findOne({ _id: getSafeObjectID(id) });
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
  await tryGetDataset(datasetId, reqContext);
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
  await tryGetDataset(datasetId, reqContext);
  const collection = getEntryCollection(datasetId, reqContext.db);
  // TODO Introduce pagination later
  const entries = await collection
    .find()
    .limit(options && options.count ? options.count : 50)
    .toArray();
  return entries.map(e => ({
    id: e._id.toHexString(),
    ...e
  }));
};

export interface CreateEntryOptions {
  skipSchemaValidation?: boolean;
}

type CheckEntryResult = { values: Values; error: UploadEntryError | null };

const processEntry = (
  ds: Dataset,
  values: Values,
  options?: CreateEntryOptions
): CheckEntryResult => {
  try {
    checkForInvalidOrEmptyValues(values);

    if (!options || !options.skipSchemaValidation) {
      const keys = Object.keys(values);
      checkForMissingValues(ds, keys);
      checkForUnsupportedValues(ds, keys);
    }

    ds.valueschemas
      .filter(v => v.type === DataType.TIME || v.type === DataType.DATETIME)
      .forEach(c => {
        values[c.name] = new Date(values[c.name]);
      });
  } catch (error) {
    return { values: {}, error };
  }

  return { values, error: null };
};

export const createEntry = async (
  datasetId: string,
  values: Values,
  reqContext: ApolloContext,
  options?: CreateEntryOptions
): Promise<Entry> => {
  const ds = await tryGetDataset(datasetId, reqContext);
  return await createEntryWithDataset(ds, values, reqContext, options);
};

export const createEntryWithDataset = async (
  ds: Dataset,
  values: Values,
  reqContext: ApolloContext,
  options?: CreateEntryOptions
): Promise<Entry> => {
  const checkedEntry = processEntry(ds, values, options);
  if (checkedEntry.error) {
    throw checkedEntry.error;
  }

  try {
    const collection = getEntryCollection<Omit<Entry, 'id'>>(
      ds.id,
      reqContext.db
    );
    const res = await collection.insertOne({
      values: checkedEntry.values
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

type CreateManyResult = {
  addedEntries: number;
  errors: { [name: string]: number };
};

export const createManyEntriesWithDataset = async (
  ds: Dataset,
  values: Array<Values>,
  reqContext: ApolloContext,
  options?: CreateEntryOptions
): Promise<CreateManyResult> => {
  if (values.length === 0) {
    return { addedEntries: 0, errors: {} };
  }

  const processedValues = await Promise.all(
    values.map(async n => processEntry(ds, n, options))
  );

  try {
    const collection = getEntryCollection<Omit<Entry, 'id'>>(
      ds.id,
      reqContext.db
    );
    const res = await collection.insertMany(
      processedValues
        .filter(v => v.error == null)
        .map(n => ({ values: n.values })),
      {
        ordered: false
      }
    );

    return {
      addedEntries: res.insertedCount,
      errors: aggregateErrors(processCheckErrors(processedValues))
    };
  } catch (err) {
    return {
      addedEntries: err.result ? err.result.result.nInserted : 0,
      errors: aggregateErrors([
        ...processCheckErrors(processedValues),
        ...(err.writeErrors
          ? err.writeErrors.map(
              e =>
                e.err.code === 11000
                  ? 'key-already-used'
                  : 'internal-write-error'
            )
          : [])
      ])
    };
  }
};

const processCheckErrors = (processedValues: Array<CheckEntryResult>) =>
  processedValues.filter(n => n.error != null).map(n => n.error!.getType());

const aggregateErrors: (
  errors: Array<string>
) => { [name: string]: number } = errors => {
  const res = {};
  errors.forEach(e => {
    res[e] = res[e] !== undefined ? res[e] + 1 : 1;
  });
  return res;
};

export const createManyEntries = async (
  datasetId: string,
  values: Array<Values>,
  reqContext: ApolloContext,
  options?: CreateEntryOptions
): Promise<CreateManyResult> => {
  const ds = await tryGetDataset(datasetId, reqContext);
  return await createManyEntriesWithDataset(ds, values, reqContext, options);
};

const checkForInvalidOrEmptyValues = (values: Values) => {
  if (!values) {
    throw new UploadEntryError('Values empty', 'value-empty');
  }

  const valuesArr = Object.entries(values);
  if (valuesArr.length === 0) {
    throw new UploadEntryError('No values specified for entry.', 'no-values');
  }

  valuesArr.forEach(v => {
    if (!v || v[0] == null || v[1] == null) {
      throw new UploadEntryError(
        `Value malformed: ${JSON.stringify(values)}`,
        'value-malformed'
      );
    }
  });
};

const checkForMissingValues = (ds: Dataset, valueNames: Array<string>) => {
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

const checkForUnsupportedValues = (ds: Dataset, valueNames: Array<string>) => {
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
  const ds = await tryGetDataset(datasetId, reqContext);
  return await createEntryWithDataset(ds, parsedValues, reqContext, options);
};

export const deleteEntry = async (
  datasetId: string,
  entryId: string,
  reqContext: ApolloContext
) => {
  const ds = await getDataset(datasetId, reqContext);
  if (!ds) {
    throw new Error('Deleting entry failed');
  }

  const collection = getEntryCollection(datasetId, reqContext.db);
  const res = await collection.deleteOne({ _id: getSafeObjectID(entryId) });
  if (res.deletedCount !== 1) {
    throw new Error('Deleting entry failed');
  }

  return true;
};
