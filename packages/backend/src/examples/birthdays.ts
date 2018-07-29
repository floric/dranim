import {
  ApolloContext,
  DataType,
  Values,
  ValueSchema
} from '@masterthesis/shared';
import * as casual from 'casual';

import { addValueSchema, createDataset } from '../main/workspace/dataset';
import { createEntry } from '../main/workspace/entry';
import { createWorkspace } from '../main/workspace/workspace';

const ENTRIES_COUNT = 2500;

export const createBirthdaysDemoData = async (reqContext: ApolloContext) => {
  const ds = await createDataset('Birthdays', reqContext);
  for (const s of birthdaysSchema) {
    await addValueSchema(ds.id, s, reqContext);
  }

  await Promise.all(
    birthdaysEntries.map(b => createEntry(ds.id, b, reqContext))
  );

  await createWorkspace('Birthdays Months', reqContext, 'Aggregate by months');
  return true;
};

const birthdaysEntries: Array<Values> = Array(ENTRIES_COUNT)
  .fill(0)
  .map((_, i) => ({
    id: i.toString(),
    firstName: casual.first_name,
    lastName: casual.last_name,
    gender: casual.boolean ? 'm' : 'w',
    value: casual.random,
    birthday: casual.date('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
  }));

const birthdaysSchema: Array<ValueSchema> = [
  {
    name: 'id',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: true
  },
  {
    name: 'lastName',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'firstName',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'gender',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: false
  },
  {
    name: 'value',
    type: DataType.NUMBER,
    required: true,
    fallback: '0',
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
