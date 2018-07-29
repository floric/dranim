import {
  ApolloContext,
  Dataset,
  DataType,
  ProcessState,
  UploadProcess,
  ValueSchema
} from '@masterthesis/shared';
import * as fastCsv from 'fast-csv';
import { Collection, Db, ObjectID } from 'mongodb';
import * as promisesAll from 'promises-all';
import { Readable } from 'stream';

import { Log } from '../../logging';
import { tryGetDataset } from '../../main/workspace/dataset';
import { createEntry } from '../../main/workspace/entry';

export class UploadEntryError extends Error {
  constructor(customMessage: string, errorName: string) {
    super(customMessage);
  }
}

export const getUploadsCollection = (
  db: Db
): Collection<UploadProcess & { _id: ObjectID }> => db.collection('Uploads');

export const getAllUploads = async (
  datasetId: string,
  reqContext: ApolloContext
): Promise<Array<UploadProcess & { _id: ObjectID }>> => {
  const collection = getUploadsCollection(reqContext.db);
  const all = await collection
    .find({ datasetId })
    .sort({ start: -1 })
    .toArray();
  return all.map(ds => ({
    id: ds._id.toHexString(),
    finish: ds.finish ? ds.finish : null,
    ...ds
  }));
};

const validateEntry = (parsedObj: any, schema: Array<ValueSchema>) => {
  if (Object.keys(parsedObj).length !== schema.length) {
    return false;
  }

  schema.forEach(s => {
    const correspondingVal = parsedObj[s.name];
    if (correspondingVal === undefined) {
      return false;
    }

    if (s.type === DataType.NUMBER && Number.isNaN(correspondingVal)) {
      return false;
    } else if (
      s.type === DataType.BOOLEAN &&
      (correspondingVal !== 'true' || correspondingVal !== 'false')
    ) {
      return false;
    } else if (s.type === DataType.DATETIME) {
      // TODO validate date
    }

    return false;
  });

  return true;
};

const processValidEntry = async (
  values: any,
  ds: Dataset,
  processId: ObjectID,
  reqContext: ApolloContext
) => {
  const collection = getUploadsCollection(reqContext.db);

  try {
    await createEntry(ds.id, values, reqContext);
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
      Log.error(err);
    }
  }
};

const processInvalidEntry = async (
  ds: Dataset,
  processId: ObjectID,
  reqContext: ApolloContext
) => {
  const collection = getUploadsCollection(reqContext.db);
  collection.updateOne({ _id: processId }, { $inc: { invalidEntries: 1 } });
};

const parseCsvFile = async (
  stream: Readable,
  filename: string,
  ds: Dataset,
  processId: ObjectID,
  reqContext: ApolloContext
): Promise<boolean> => {
  const csvStream = fastCsv({
    ignoreEmpty: true,
    objectMode: true,
    strictColumnHandling: true,
    trim: true,
    headers: ds.valueschemas.map(s => s.name)
  })
    .validate(obj => validateEntry)
    .on('data', values => processValidEntry(values, ds, processId, reqContext))
    .on('data-invalid', () => processInvalidEntry(ds, processId, reqContext))
    .on('end', () => {
      Log.info(`Finished import of ${filename}.`);
    });

  Log.info(`Started import of ${filename}.`);

  try {
    await new Promise((resolve, reject) =>
      stream
        .on('error', err => Log.error(err))
        .pipe(csvStream)
        .on('error', err => Log.error(err))
        .on('finish', () => resolve())
    );
  } catch (err) {
    Log.error(err);
  }

  return true;
};

const processUpload = async (
  upload,
  ds: Dataset,
  processId: ObjectID,
  reqContext: ApolloContext
): Promise<void> => {
  const uploadsCollection = getUploadsCollection(reqContext.db);

  try {
    const { stream, filename } = await upload;
    await parseCsvFile(stream, filename, ds, processId, reqContext);
    await uploadsCollection.updateOne(
      { _id: processId },
      { $push: { fileNames: filename } }
    );
  } catch (err) {
    Log.error(err);
    throw new Error('Upload has failed.');
  }
};

export const uploadEntriesCsv = async (
  files: Array<any>,
  datasetId: string,
  reqContext: ApolloContext
): Promise<UploadProcess> => {
  try {
    const uploadsCollection = getUploadsCollection(reqContext.db);
    const ds = await tryGetDataset(datasetId, reqContext);
    const newProcess = {
      addedEntries: 0,
      failedEntries: 0,
      invalidEntries: 0,
      start: new Date(),
      state: ProcessState.STARTED,
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

    await doUploadAsync(ds, processId, files, reqContext);

    return process;
  } catch (err) {
    Log.error(err);
    throw new Error('Upload failed');
  }
};

export const doUploadAsync = async (
  ds: Dataset,
  processId: ObjectID,
  files: Array<any>,
  reqContext: ApolloContext
) => {
  const uploadsCollection = getUploadsCollection(reqContext.db);
  const { reject } = await promisesAll.all(
    files.map(f => processUpload(f, ds, processId, reqContext))
  );

  if (reject.length) {
    reject.forEach(({ name, message }) => {
      Log.error(`Upload failed for ${name}: ${message}`);
    });
    await uploadsCollection.updateOne(
      { _id: processId },
      { $set: { state: ProcessState.ERROR, finish: new Date() } }
    );
  } else {
    await uploadsCollection.updateOne(
      { _id: processId },
      { $set: { state: ProcessState.SUCCESSFUL, finish: new Date() } }
    );
  }
};
