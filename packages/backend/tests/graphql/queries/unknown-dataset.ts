import { QueryTestCase } from '../../test-utils';

export const unknownDatasetTest: QueryTestCase = {
  id: 'UnknownDataset',
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
  beforeTest: () => Promise.resolve({ variables: { id: 'abc' } }),
  expected: {
    dataset: null
  }
};
