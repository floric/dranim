import * as fs from 'fs';
import * as fastCsv from 'fast-csv';
import { ObjectID, Db } from 'mongodb';
import * as promisesAll from 'promises-all';

import { Entry, createEntry } from './entry';
import { getDatasetsCollection, Dataset, Valueschema } from './dataset';
import { dataset } from '../resolvers/dataset';
import { Readable } from 'stream';

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

const processInvalidEntry = (parsedObj: any) => {
  console.log(`Invalid entry: ${parsedObj}`);
};

const parseCsvFile = (
  stream: Readable,
  filename: string,
  ds: Dataset,
  db: Db
) => {
  const csvStream = fastCsv({
    ignoreEmpty: true,
    strictColumnHandling: true,
    trim: true,
    headers: ds.valueschemas.map(s => s.name)
  })
    .validate(obj => validateEntry)
    .on('data', (entry: Entry) => processValidEntry(entry, ds, db))
    .on('data-invalid', processInvalidEntry)
    .on('end', () => {
      console.log(`Finished import of ${filename}.`);
    });

  console.log(`Started import of ${filename}.`);

  return new Promise((resolve, reject) =>
    stream
      .on('error', reject)
      .pipe(csvStream)
      .on('error', reject)
      .on('finish', () => resolve(true))
  );
};

const processUpload = async (upload, ds: Dataset, db: Db) => {
  try {
    const { stream, filename, mimetype, encoding } = await upload;
    await parseCsvFile(stream, filename, ds, db);
    return true;
  } catch (err) {
    console.log(err);
    return false;
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

  if (reject.length) {
    reject.forEach(({ name, message }) => {
      console.error(`${name}: ${message}`);
    });
  }

  return resolve;
};
