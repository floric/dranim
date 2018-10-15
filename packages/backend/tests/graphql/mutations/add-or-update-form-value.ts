import { NumberInputNode } from '../../../src/main/nodes/number';
import { createNode } from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';

export const addOrUpdateFormTest: MutationTestCase = {
  id: 'Add or Update Form',
  mutation: {
    query: `
      mutation addOrUpdateFormValue($nodeId: ID!, $name: String!, $value: String!) {
        addOrUpdateFormValue(nodeId: $nodeId, name: $name, value: $value)
      }
    `,
    expected: {
      addOrUpdateFormValue: true
    }
  },
  query: {
    query: `
      query {
        workspaces {
          id
          nodes {
            id
            form
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
              form: {
                value: 2
              }
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

    return {
      variables: { nodeId: node.id, name: 'value', value: JSON.stringify(2) }
    };
  }
};
