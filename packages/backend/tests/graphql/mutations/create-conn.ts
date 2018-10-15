import {
  NumberInputNode,
  NumberOutputNode
} from '../../../src/main/nodes/number';
import { createNode } from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';

export const createConnTest: MutationTestCase = {
  id: 'Create Connection',
  mutation: {
    query: `
      mutation createConnection($input: ConnectionInput!) {
        createConnection(input: $input) {
          id
          from {
            nodeId
            name
          }
          to {
            nodeId
            name
          }
        }
      }
    `,
    expected: {
      createConnection: {
        id: expect.any(String),
        from: {
          nodeId: expect.any(String),
          name: 'value'
        },
        to: {
          nodeId: expect.any(String),
          name: 'value'
        }
      }
    }
  },
  query: {
    query: `
      query {
        workspaces {
          id
          connections {
            id
            from {
              nodeId
              name
            }
            to {
              nodeId
              name
            }
          }
        }
      }
  `,
    expected: {
      workspaces: [
        {
          connections: [
            {
              from: { name: 'value', nodeId: expect.any(String) },
              id: expect.any(String),
              to: { name: 'value', nodeId: expect.any(String) }
            }
          ],
          id: expect.any(String)
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    const ws = await createWorkspace('test', reqContext);
    const iNode = await createNode(
      NumberInputNode.type,
      ws.id,
      [],
      0,
      0,
      reqContext
    );
    const oNode = await createNode(
      NumberOutputNode.type,
      ws.id,
      [],
      0,
      0,
      reqContext
    );

    return {
      variables: {
        input: {
          from: { nodeId: iNode.id, name: 'value' },
          to: { nodeId: oNode.id, name: 'value' }
        }
      }
    };
  }
};
