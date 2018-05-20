import fastCsv from 'fast-csv';
import { ObjectID, Db, Collection } from 'mongodb';
import * as promisesAll from 'promises-all';
import { Readable } from 'stream';

import { createEntry } from './entry';
import { Dataset, Valueschema } from './dataset';
import { getDataset } from '../resolvers/dataset';
import { UploadProcess } from '@masterthesis/shared';

export class UploadEntryError extends Error {
  constructor(customMessage: string, errorName: string) {
    super(customMessage);
  }
}

export const getUploadsCollection = (
  db: Db
): Collection<UploadProcess & { _id: ObjectID }> => {
  return db.collection('Uploads');
};

export const getAllUploads = async (
  db: Db,
  datasetId: string | null
): Promise<Array<UploadProcess & { _id: ObjectID }>> => {
  const collection = getUploadsCollection(db);
  const all = await collection
    .find(datasetId ? { datasetId } : {})
    .sort({ start: -1 })
    .toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    finish: ds.finish ? ds.finish : null,
    ...ds
  }));
};

const validateEntry = (parsedObj: any, schema: Array<Valueschema>) => {
  if (Object.keys(parsedObj).length !== schema.length) {
    return false;
  }

  schema.forEach(s => {
    const correspondingVal = parsedObj[s.name];
    if (correspondingVal === undefined) {
      return false;
    }

    if (s.type === 'Number' && Number.isNaN(correspondingVal)) {
      return false;
    } else if (
      s.type === 'Boolean' &&
      (correspondingVal !== 'true' || correspondingVal !== 'false')
    ) {
      return false;
    } else if (s.type === 'Date') {
      // TODO validate date
    }

    return false;
  });

  return true;
};

const processValidEntry = async (
  values: any,
  ds: Dataset,
  db: Db,
  processId: ObjectID
) => {
  const valueKeys = Object.keys(values);
  const collection = getUploadsCollection(db);

  try {
    await createEntry(
      db,
      ds.id,
      valueKeys.map(k => ({
        name: k,
        val: values[k]
      }))
    );
    await collection.updateOne(
      { _id: processId },
      { $inc: { addedEntries: 1 } }
    );
  } catch (err) {
    if (err.errorName && err.errorName.length > 0) {
      await collection.updateOne(
        { _id: processId },
        {
          $inc: {
            failedEntries: 1,
            [`errors.${err.errorName}.count`]: 1
          },
          $set: {
            [`errors.${err.errorName}.message`]: err.message
          }
        },
        { upsert: true }
      );
    } else {
      console.log(err);
    }
  }
};

const processInvalidEntry = async (
  ds: Dataset,
  db: Db,
  processId: ObjectID
) => {
  const collection = getUploadsCollection(db);
  collection.updateOne({ _id: processId }, { $inc: { invalidEntries: 1 } });
};

const parseCsvFile = async (
  stream: Readable,
  filename: string,
  ds: Dataset,
  db: Db,
  processId: ObjectID
): Promise<boolean> => {
  const csvStream = fastCsv({
    ignoreEmpty: true,
    objectMode: true,
    strictColumnHandling: true,
    trim: true,
    headers: ds.valueschemas.map(s => s.name)
  })
    .validate(obj => validateEntry)
    .on('data', values => processValidEntry(values, ds, db, processId))
    .on('data-invalid', () => processInvalidEntry(ds, db, processId))
    .on('end', () => {
      console.log(`Finished import of ${filename}.`);
    });

  console.log(`Started import of ${filename}.`);

  try {
    await new Promise((resolve, reject) =>
      stream
        .on('error', err => console.log(err))
        .pipe(csvStream)
        .on('error', err => console.log(err))
        .on('finish', () => resolve())
    );
  } catch (err) {
    console.log(err);
  }

  return true;
};

const processUpload = async (
  upload,
  ds: Dataset,
  db: Db,
  processId: ObjectID
): Promise<void> => {
  const uploadsCollection = getUploadsCollection(db);

  try {
    const { stream, filename } = await upload;
    await parseCsvFile(stream, filename, ds, db, processId);
    await uploadsCollection.updateOne(
      { _id: processId },
      { $push: { fileNames: filename } }
    );
  } catch (err) {
    console.log(err);
    throw new Error('Upload has failed.');
  }
};

export const uploadEntriesCsv = async (
  db: Db,
  files: Array<any>,
  datasetId: string
): Promise<UploadProcess> => {
  try {
    const uploadsCollection = getUploadsCollection(db);
    const ds = await getDataset(db, datasetId);
    if (!ds) {
      throw new Error('Dataset not found.');
    }

    const newProcess = {
      addedEntries: 0,
      failedEntries: 0,
      invalidEntries: 0,
      start: new Date(),
      state: 'STARTED',
      datasetId,
      fileNames: [],
      errors: {}
    };
    const res = await uploadsCollection.insertOne(newProcess);
    if (res.result.ok !== 1 || res.insertedCount !== 1) {
      throw new Error('Creating Upload process failed.');
    }

    const process: UploadProcess = {
      id: res.ops[0]._id.toHexString(),
      ...res.ops[0]
    };
    const processId = new ObjectID(process.id);

    // don't await for entry processing
    doUploadAsync(db, ds, processId, files);

    return process;
  } catch (err) {
    console.log(err);
    throw new Error('Upload failed');
  }
};

export const doUploadAsync = async (
  db: Db,
  ds: Dataset,
  processId: ObjectID,
  files: Array<any>
) => {
  const uploadsCollection = getUploadsCollection(db);
  const { reject } = await promisesAll.all(
    files.map(f => processUpload(f, ds, db, processId))
  );

  if (reject.length) {
    reject.forEach(({ name, message }) => {
      console.error(`${name}: ${message}`);
    });
    await uploadsCollection.updateOne(
      { _id: processId },
      { $set: { state: 'ERROR', finish: new Date() } }
    );
  } else {
    await uploadsCollection.updateOne(
      { _id: processId },
      { $set: { state: 'FINISHED', finish: new Date() } }
    );
  }
};
