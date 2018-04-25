import * as fs from 'fs';
import * as fastCsv from 'fast-csv';
import { ObjectID, Db } from 'mongodb';
import * as promisesAll from 'promises-all';
import { Readable } from 'stream';

import { Entry, createEntry } from './entry';
import { getDatasetsCollection, Dataset, Valueschema } from './dataset';
import { dataset } from '../resolvers/dataset';
import { UploadProgress } from './util/UploadProgress';

export interface UploadResult {
  validEntries: number;
  invalidEntries: number;
}

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

const processValidEntry = (entry: Entry, ds: Dataset, db: Db) => {
  const valueKeys = Object.keys(entry);
  createEntry(
    db,
    new ObjectID(ds.id),
    valueKeys.map(k => ({
      name: k,
      val: entry[k]
    }))
  );
};

const parseCsvFile = async (
  stream: Readable,
  filename: string,
  ds: Dataset,
  db: Db
): Promise<UploadResult> => {
  const uploadProgress = new UploadProgress();

  const csvStream = fastCsv({
    ignoreEmpty: true,
    strictColumnHandling: true,
    trim: true,
    headers: ds.valueschemas.map(s => s.name)
  })
    .validate(obj => validateEntry)
    .on('data', (entry: Entry) => {
      processValidEntry(entry, ds, db);
      uploadProgress.increaseValidEntries();
    })
    .on('data-invalid', () => {
      uploadProgress.increaseInvalidEntries();
    })
    .on('end', () => {
      console.log(`Finished import of ${filename}.`);
    });

  console.log(`Started import of ${filename}.`);

  const process = await new Promise((resolve, reject) =>
    stream
      .on('error', reject)
      .pipe(csvStream)
      .on('error', reject)
      .on('finish', () => resolve())
  );

  return {
    validEntries: uploadProgress.validEntries,
    invalidEntries: uploadProgress.invalidEntries
  };
};

const processUpload = async (
  upload,
  ds: Dataset,
  db: Db
): Promise<UploadResult> => {
  try {
    const { stream, filename, mimetype, encoding } = await upload;
    return await parseCsvFile(stream, filename, ds, db);
  } catch (err) {
    console.log(err);
    throw new Error('Upload has failed.');
  }
};

export const uploadEntriesCsv = async (
  db: Db,
  files: Array<any>,
  datasetId: ObjectID
) => {
  const ds = await dataset(db, datasetId);
  const { resolve, reject } = await promisesAll.all(
    files.map(f => processUpload(f, ds, db))
  );

  const successfullUploads: Array<UploadResult> = resolve;

  if (reject.length) {
    reject.forEach(({ name, message }) => {
      console.error(`${name}: ${message}`);
    });
  }

  return successfullUploads.reduce((x, y) => ({
    validEntries: x.validEntries + y.validEntries,
    invalidEntries: x.invalidEntries + y.invalidEntries
  }));
};
