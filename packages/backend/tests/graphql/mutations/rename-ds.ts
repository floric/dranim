import { createDataset } from '../../../src/main/workspace/dataset';
import { MutationTestCase } from '../../test-utils';

export const renameDsTest: MutationTestCase = {
  id: 'Rename Dataset',
  mutation: {
    query: `
      mutation renameDataset($id: ID!, $name: String!) {
        renameDataset(id: $id, name: $name)
      }
    `,
    expected: {
      renameDataset: true
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
    const ds = await createDataset('ABC', reqContext);
    return { variables: { id: ds.id, name: 'XYZ' } };
  }
};
