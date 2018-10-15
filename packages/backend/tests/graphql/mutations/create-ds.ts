import { MutationTestCase } from '../../test-utils';

export const createDsTest: MutationTestCase = {
  id: 'Create Dataset',
  mutation: {
    query: `
      mutation createDataset($name: String!) {
        createDataset(name: $name) {
          id
        }
      }
    `,
    expected: {
      createDataset: {
        id: expect.any(String)
      }
    }
  },
  query: {
    query: `
      query {
        datasets {
          id
          name
        }
      }
  `,
    expected: {
      datasets: [
        {
          id: expect.any(String),
          name: 'XYZ'
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    return { variables: { name: 'XYZ' } };
  }
};
