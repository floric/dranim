import { MutationTestCase } from '../../test-utils';

export const createWsTest: MutationTestCase = {
  id: 'Create Workspace',
  mutation: {
    query: `
      mutation createWorkspace($name: String!) {
        createWorkspace(name: $name) {
          id
        }
      }
    `,
    expected: {
      createWorkspace: {
        id: expect.any(String)
      }
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
    return { variables: { name: 'XYZ' } };
  }
};
