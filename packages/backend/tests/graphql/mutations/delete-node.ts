import { NumberInputNode } from '../../../src/main/nodes/number';
import { createNode } from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';

export const deleteNodeTest: MutationTestCase = {
  id: 'Delete Node',
  mutation: {
    query: `
      mutation deleteNode($id: ID!) {
        deleteNode(id: $id)
      }
    `,
    expected: {
      deleteNode: true
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
          nodes: []
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    const ws = await createWorkspace('test', reqContext);
    const node = await createNode(
      NumberInputNode.type,
      ws.id,
      [],
      0,
      0,
      reqContext
    );

    return { variables: { id: node.id } };
  }
};
