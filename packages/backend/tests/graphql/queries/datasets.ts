import { DataType } from '@masterthesis/shared';

import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { createEntry } from '../../../src/main/workspace/entry';
import { QueryTestCase } from '../../test-utils';

export const datasetsTest: QueryTestCase = {
  id: 'Datasets',
  query: `
    query {
      datasets {
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
    const ds1 = await createDataset('DS1', reqContext);
    const ds2 = await createDataset('DS2', reqContext);
    await Promise.all([
      addValueSchema(
        ds1.id,
        {
          name: 'count',
          type: DataType.NUMBER,
          fallback: '42',
          required: true,
          unique: false
        },
        reqContext
      ),
      addValueSchema(
        ds2.id,
        {
          name: 'name',
          type: DataType.STRING,
          fallback: 'Florian',
          required: true,
          unique: true
        },
        reqContext
      ),
      addValueSchema(
        ds2.id,
        {
          name: 'birthday',
          type: DataType.DATETIME,
          fallback: new Date(99999999999).toISOString(),
          required: false,
          unique: true
        },
        reqContext
      )
    ]);
    await createEntry(ds1.id, { count: 1 }, reqContext);
    await createEntry(ds1.id, { count: 2 }, reqContext);
    await createEntry(ds1.id, { count: 3 }, reqContext);
    await createEntry(
      ds2.id,
      { name: 'Anna', birthday: new Date(0).toISOString() },
      reqContext
    );
    return {};
  },
  expected: {
    datasets: [
      {
        created: expect.any(Number),
        description: '',
        entriesCount: 3,
        id: expect.any(String),
        latestEntries: [
          { id: expect.any(String), values: '{"count":1}' },
          { id: expect.any(String), values: '{"count":2}' },
          { id: expect.any(String), values: '{"count":3}' }
        ],
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
      },
      {
        created: expect.any(Number),
        description: '',
        entriesCount: 1,
        id: expect.any(String),
        latestEntries: [
          {
            id: expect.any(String),
            values: '{"name":"Anna","birthday":"1970-01-01T00:00:00.000Z"}'
          }
        ],
        name: 'DS2',
        valueschemas: expect.arrayContaining([
          {
            fallback: 'Florian',
            name: 'name',
            required: true,
            type: 'String',
            unique: true
          },
          {
            fallback: '1973-03-03T09:46:39.999Z',
            name: 'birthday',
            required: false,
            type: 'Datetime',
            unique: true
          }
        ])
      }
    ]
  }
};
