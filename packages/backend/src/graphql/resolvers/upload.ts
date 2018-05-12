import * as fs from 'fs';
import fastCsv from 'fast-csv';
import { ObjectID, Db } from 'mongodb';
import * as promisesAll from 'promises-all';
import { Readable, Writable } from 'stream';

import { Entry, createEntry } from './entry';
import { getDatasetsCollection, Dataset, Valueschema } from './dataset';
import { getDataset } from '../resolvers/dataset';
import { UploadProgress } from './util/UploadProgress';
import { updateNode } from './workspace';
import { Upper } from './util/TransformStream';

export interface UploadProcess {
  id: string;
  start: Date;
  finish: Date | null;
  datasetId: string;
  errors: Array<{ name: string; message: string; count: number }>;
  state: 'STARTED' | 'PROCESSING' | 'FINISHED' | 'ERROR';
  addedEntries: number;
  failedEntries: number;
  invalidEntries: number;
}

export class UploadEntryError extends Error {
  constructor(private customMessage: string, private errorName: string) {
    super(customMessage);
  }
}

export const getUploadsCollection = (db: Db) => {
  return db.collection('Uploads');
};

export const getAllUploads = async (db: Db, datasetId: string | null) => {
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
      new ObjectID(ds.id),
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
      const res = await collection.updateOne(
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
    const process = await new Promise((resolve, reject) =>
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
    const { stream, filename, mimetype, encoding } = await upload;
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
  datasetId: ObjectID
): Promise<UploadProcess> => {
  try {
    const ds = await getDataset(db, datasetId);

    const uploadsCollection = getUploadsCollection(db);
    const newProcess = {
      addedEntries: 0,
      failedEntries: 0,
      invalidEntries: 0,
      start: new Date(),
      state: 'STARTED',
      datasetId: datasetId.toHexString(),
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

    const { resolve, reject } = await promisesAll.all(
      files.map(f => processUpload(f, ds, db, processId))
    );

    const successfullUploads: Array<boolean> = resolve;

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

    return process;
  } catch (err) {
    console.log(err);
    throw new Error('Upload failed');
  }
};
