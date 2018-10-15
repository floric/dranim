import { NumberInputNode } from '../../../src/main/nodes/number';
import { createNode } from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';

export const updateNodePosTest: MutationTestCase = {
  id: 'Update Node Pos',
  mutation: {
    query: `
      mutation updateNodePosition($id: ID!, $x: Float!, $y: Float!) {
        updateNodePosition(id: $id, x: $x, y: $y)
      }
    `,
    expected: {
      updateNodePosition: true
    }
  },
  query: {
    query: `
      query {
        workspaces {
          id
          nodes {
            id
            x
            y
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
              id: expect.any(String),
              x: 3,
              y: 4
            }
          ]
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
      1,
      2,
      reqContext
    );

    return { variables: { id: node.id, x: 3, y: 4 } };
  }
};
