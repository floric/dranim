import { DataType } from '../../../../shared/lib';
import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { MutationTestCase } from '../../test-utils';

export const addEntryTest: MutationTestCase = {
  id: 'Add Entry',
  mutation: {
    query: `
      mutation addEntry($datasetId: ID!, $values: String!) {
        addEntry(datasetId: $datasetId, values: $values) {
          id
        }
      }
    `,
    expected: {
      addEntry: {
        id: expect.any(String)
      }
    }
  },
  query: {
    query: `
      query {
        datasets {
          id
          latestEntries {
            id
            values
          }
        }
      }
  `,
    expected: {
      datasets: [
        {
          id: expect.any(String),
          latestEntries: [
            {
              id: expect.any(String)
            }
          ]
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    const ds = await createDataset('ABC', reqContext);
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
    return {
      variables: { datasetId: ds.id, values: JSON.stringify({ count: 17 }) }
    };
  }
};
