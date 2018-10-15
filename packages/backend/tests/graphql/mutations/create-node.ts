import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';
import { NumberInputNode } from '../../../src/main/nodes/number';

export const createNodeTest: MutationTestCase = {
  id: 'Create Node',
  mutation: {
    query: `
      mutation createNode($type: String!
        $workspaceId: ID!
        $contextIds: [String!]!
        $x: Float!
        $y: Float!) {
        createNode(type: $type, workspaceId: $workspaceId, contextIds: $contextIds, x: $x, y: $y) {
          id
        }
      }
    `,
    expected: {
      createNode: {
        id: expect.any(String)
      }
    }
  },
  query: {
    query: `
      query {
        workspaces {
          id
          nodes {
            id
          }
        }
      }
  `,
    expected: {
      workspaces: [
        {
          id: expect.any(String),
          nodes: [
            {
              id: expect.any(String)
            }
          ]
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    const ws = await createWorkspace('test', reqContext);
    return {
      variables: {
        workspaceId: ws.id,
        type: NumberInputNode.type,
        contextIds: [],
        x: 0,
        y: 0
      }
    };
  }
};
