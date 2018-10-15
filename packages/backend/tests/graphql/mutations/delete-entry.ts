import { DataType } from '@masterthesis/shared';

import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { createEntry } from '../../../src/main/workspace/entry';
import { MutationTestCase } from '../../test-utils';

export const deleteEntryTest: MutationTestCase = {
  id: 'Delete Entry',
  mutation: {
    query: `
      mutation deleteEntry($datasetId: ID!, $entryId: ID!) {
        deleteEntry(datasetId: $datasetId, entryId: $entryId)
      }
    `,
    expected: {
      deleteEntry: true
    }
  },
  query: {
    query: `
      query {
        datasets {
          id
          latestEntries {
            id
          }
        }
      }
  `,
    expected: {
      datasets: [
        {
          id: expect.any(String),
          latestEntries: []
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    const ds = await createDataset('test', reqContext);
    await addValueSchema(
      ds.id,
      {
        name: 'count',
        type: DataType.NUMBER,
        required: true,
        unique: false,
        fallback: ''
      },
      reqContext
    );
    const entry = await createEntry(ds.id, { count: 9 }, reqContext);

    return { variables: { entryId: entry.id, datasetId: ds.id } };
  }
};
