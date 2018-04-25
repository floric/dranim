import * as fs from 'fs';
import * as fastCsv from 'fast-csv';
import { ObjectID, Db } from 'mongodb';
import * as promisesAll from 'promises-all';

import { Entry } from './entry';
import { getDatasetsCollection, Dataset } from './dataset';
import { dataset } from '../resolvers/dataset';
import { Readable } from 'stream';

/*
[
      'id',
      'start_day',
      'start_month',
      'start_year',
      'shipmaster_1',
      'shipmaster_2',
      'shipmaster_3',
      'shipmaster_4',
      'domicile_city',
      'domicile_countryA',
      'domicile_countryB',
      'domicile_countryC',
      'domicile_countryD',
      'domicile_countryE',
      'domicile_coordsA',
      'domicile_coordsB',
      'domicile_coordsC',
      'domicile_coordsD',
      'departure_city',
      'departure_countryA',
      'departure_countryB',
      'departure_countryC',
      'departure_countryD',
      'departure_countryE',
      'departure_coordsA',
      'departure_coordsB',
      'departure_coordsC',
      'departure_coordsD',
      'destination_city',
      'destination_countryA',
      'destination_countryB',
      'destination_countryC',
      'destination_countryD',
      'destination_countryE',
      'destination_coordsA',
      'destination_coordsB',
      'destination_coordsC',
      'destination_coordsD',
      'items',
      'tonnnes'
    ]*/

const validateEntry = (parsedObj: any) => {
  return true;
};

const processValidEntry = (entry: Entry) => {
  console.log(`Valid entry :)`);
};

const processInvalidEntry = (parsedObj: any) => {
  console.log(`Invalid entry: ${parsedObj}`);
};

const parseCsvFile = (stream: Readable, filename: string, ds: Dataset) => {
  const csvStream = fastCsv({
    ignoreEmpty: true,
    trim: true,
    headers: ds.valueschemas.map(s => s.name)
  })
    .validate(validateEntry)
    .on('data', processValidEntry)
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

const processUpload = async (upload, ds: Dataset) => {
  try {
    const { stream, filename, mimetype, encoding } = await upload;
    await parseCsvFile(stream, filename, ds);
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
    files.map(f => processUpload(f, ds))
  );

  if (reject.length) {
    reject.forEach(({ name, message }) => {
      console.error(`${name}: ${message}`);
    });
  }

  return resolve;
};
