import {
  ApolloContext,
  DataType,
  Values,
  ValueSchema
} from '@masterthesis/shared';
import casual from 'casual';

import { Log } from '../logging';
import { addValueSchema, createDataset } from '../main/workspace/dataset';
import { createManyEntries } from '../main/workspace/entry';
import { createWorkspace } from '../main/workspace/workspace';

const ENTRIES_COUNT = 1000000;

export const createBirthdaysDemoData = async (reqContext: ApolloContext) => {
  const ds = await createDataset('Birthdays', reqContext);
  for (const s of birthdaysSchema) {
    await addValueSchema(ds.id, s, reqContext);
  }

  const entries = createBirthdaysEntries();
  Log.info('Generated birthdays entries');

  await createManyEntries(ds.id, entries, reqContext);
  await createWorkspace('Birthday Months', reqContext, 'Aggregate by months');

  return true;
};

const createBirthdaysEntries: () => Array<Values> = () =>
  Array(ENTRIES_COUNT)
    .fill(0)
    .map((_, i) => ({
      firstName: casual.first_name,
      lastName: casual.last_name,
      gender: casual.boolean ? 'm' : 'f',
      birthday: new Date(casual.date('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'))
    }));

const birthdaysSchema: Array<ValueSchema> = [
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
    name: 'birthday',
    type: DataType.DATETIME,
    required: true,
    fallback: '',
    unique: false
  }
];
