import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';

export const deleteWsTest: MutationTestCase = {
  id: 'Delete Workspace',
  mutation: {
    query: `
      mutation deleteWorkspace($id: ID!) {
        deleteWorkspace(id: $id)
      }
    `,
    expected: {
      deleteWorkspace: true
    }
  },
  query: {
    query: `
      query {
        workspaces {
          id
          name
        }
      }
  `,
    expected: {
      workspaces: []
    }
  },
  beforeTest: async reqContext => {
    const ds = await createWorkspace('test', reqContext);
    return { variables: { id: ds.id } };
  }
};
