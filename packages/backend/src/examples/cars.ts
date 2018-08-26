import {
  ApolloContext,
  DataType,
  Values,
  ValueSchema
} from '@masterthesis/shared';

import { addValueSchema, createDataset } from '../main/workspace/dataset';
import { createEntry } from '../main/workspace/entry';
import { createWorkspace } from '../main/workspace/workspace';

const entries: Array<Values> = [
  { name: 'Volkswagen', share: 18.4, 'registered-vehicles': 634270 },
  { name: 'Mercedes', share: 9.5, 'registered-vehicles': 326188 },
  { name: 'Audi', share: 8.2, 'registered-vehicles': 283196 },
  { name: 'BMW', share: 7.6, 'registered-vehicles': 261864 },
  { name: 'Ford', share: 7.2, 'registered-vehicles': 246589 },
  { name: 'Opel', share: 7.1, 'registered-vehicles': 243715 },
  { name: 'Skoda', share: 5.6, 'registered-vehicles': 194230 }
];

const schema: Array<ValueSchema> = [
  {
    name: 'name',
    type: DataType.STRING,
    required: true,
    fallback: '',
    unique: true
  },
  {
    name: 'registered-vehicles',
    type: DataType.NUMBER,
    required: true,
    fallback: '',
    unique: true
  },
  {
    name: 'share',
    type: DataType.NUMBER,
    required: true,
    fallback: '',
    unique: false
  }
];

export const createCarsDemoData = async (reqContext: ApolloContext) => {
  const ds = await createDataset('Car Manufacturers', reqContext);
  for (const s of schema) {
    await addValueSchema(ds.id, s, reqContext);
  }

  await Promise.all(entries.map(b => createEntry(ds.id, b, reqContext)));

  await createWorkspace('Car Manufactures', reqContext, '');
  return true;
};
