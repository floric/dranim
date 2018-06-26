import { DataType, Values } from '@masterthesis/shared';
import * as casual from 'casual';
import { Db } from 'mongodb';

import {
  addValueSchema,
  createDataset,
  Valueschema
} from '../main/workspace/dataset';
import { createEntry } from '../main/workspace/entry';
import { createWorkspace } from '../main/workspace/workspace';

const ENTRIES_COUNT = 2500;

export const createBirthdaysDemoData = async (db: Db) => {
  const ds = await createDataset(db, 'Birthdays');
  for (const s of birthdaysSchema) {
    await addValueSchema(db, ds.id, s);
  }

  await Promise.all(birthdaysEntries.map(b => createEntry(db, ds.id, b)));

  await createWorkspace(db, 'Birthdays Months', 'Aggregate by months');
  return true;
};

const birthdaysEntries: Array<Values> = Array(ENTRIES_COUNT)
  .fill(0)
  .map((_, i) => ({
    id: i.toString(),
    name: casual.name,
    birthday: casual.date('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
  }));

const birthdaysSchema: Array<Valueschema> = [
  {
    name: 'id',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: true
  },
  {
    name: 'name',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'birthday',
    type: DataType.DATETIME,
    required: true,
    fallback: '',
    unique: false
  }
];
