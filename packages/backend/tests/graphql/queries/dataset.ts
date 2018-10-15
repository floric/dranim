import { DataType } from '@masterthesis/shared';

import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { createEntry } from '../../../src/main/workspace/entry';
import { QueryTestCase } from '../../test-utils';

export const datasetTest: QueryTestCase = {
  id: 'Dataset',
  query: `
    query Dataset($id: ID!) {
      dataset(id: $id) {
        id
        name
        valueschemas {
          name
          type
          required
          fallback
          unique
        }
        created
        description
        entriesCount
        latestEntries {
          id
          values
        }
      }
    }
  `,
  beforeTest: async reqContext => {
    const ds = await createDataset('DS1', reqContext);
    await addValueSchema(
      ds.id,
      {
        name: 'count',
        type: DataType.NUMBER,
        fallback: '42',
        required: true,
        unique: false
      },
      reqContext
    );
    await Promise.all([
      createEntry(ds.id, { count: 1 }, reqContext),
      createEntry(ds.id, { count: 2 }, reqContext),
      createEntry(ds.id, { count: 3 }, reqContext)
    ]);
    return { variables: { id: ds.id } };
  },
  expected: {
    dataset: {
      created: expect.any(Number),
      description: '',
      entriesCount: 3,
      id: expect.any(String),
      latestEntries: expect.arrayContaining([
        { id: expect.any(String), values: '{"count":1}' },
        { id: expect.any(String), values: '{"count":2}' },
        { id: expect.any(String), values: '{"count":3}' }
      ]),
      name: 'DS1',
      valueschemas: [
        {
          fallback: '42',
          name: 'count',
          required: true,
          type: 'Number',
          unique: false
        }
      ]
    }
  }
};
