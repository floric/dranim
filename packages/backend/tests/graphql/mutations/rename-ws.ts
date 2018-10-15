import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';

export const renameWsTest: MutationTestCase = {
  id: 'Rename Workspace',
  mutation: {
    query: `
      mutation renameWorkspace($id: ID!, $name: String!) {
        renameWorkspace(id: $id, name: $name)
      }
    `,
    expected: {
      renameWorkspace: true
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
      workspaces: [
        {
          id: expect.any(String),
          name: 'XYZ'
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    const ds = await createWorkspace('ABC', reqContext);
    return { variables: { id: ds.id, name: 'XYZ' } };
  }
};
