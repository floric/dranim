import { DataType, Values } from '@masterthesis/shared';
import { Db } from 'mongodb';

import {
  addValueSchema,
  createDataset,
  Valueschema
} from '../main/workspace/dataset';
import { createEntry } from '../main/workspace/entry';
import { createWorkspace } from '../main/workspace/workspace';

export const createBirthdaysDemoData = async (db: Db) => {
  const ds = await createDataset(db, 'Birthdays');
  for (const s of birthdaysSchema) {
    await addValueSchema(db, ds.id, s);
  }

  await Promise.all(birthdaysEntries.map(b => createEntry(db, ds.id, b)));

  await createWorkspace(db, 'Birthdays Months', 'Aggregate by months');
  return true;
};

const birthdaysEntries: Array<Values> = [
  { id: '1', name: 'Florian Richter', birthday: '1993-08-30T06:35:55.410Z' },
  { id: '2', name: 'Donald Trump', birthday: '1880-02-30T06:35:55.410Z' },
  { id: '3', name: 'Fred Feuerstein', birthday: '1900-01-30T06:35:55.410Z' }
];

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
    type: DataType.DATE,
    required: true,
    fallback: '',
    unique: false
  }
];
