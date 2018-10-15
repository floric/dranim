import { createDataset } from '../../../src/main/workspace/dataset';
import { MutationTestCase } from '../../test-utils';

export const deleteDsTest: MutationTestCase = {
  id: 'Delete Dataset',
  mutation: {
    query: `
      mutation deleteDataset($id: ID!) {
        deleteDataset(id: $id)
      }
    `,
    expected: {
      deleteDataset: true
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
      datasets: []
    }
  },
  beforeTest: async reqContext => {
    const ds = await createDataset('test', reqContext);
    return { variables: { id: ds.id } };
  }
};
