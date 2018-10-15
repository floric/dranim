import {
  NumberInputNode,
  NumberOutputNode
} from '../../../src/main/nodes/number';
import { createConnection } from '../../../src/main/workspace/connections';
import { createNode } from '../../../src/main/workspace/nodes';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { MutationTestCase } from '../../test-utils';

export const deleteConnTest: MutationTestCase = {
  id: 'Delete Connection',
  mutation: {
    query: `
      mutation deleteConnection($id: ID!) {
        deleteConnection(id: $id)
      }
    `,
    expected: {
      deleteConnection: true
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
          connections: [],
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
    const { id } = await createConnection(
      { nodeId: iNode.id, name: 'value' },
      { nodeId: oNode.id, name: 'value' },
      reqContext
    );

    return {
      variables: {
        id
      }
    };
  }
};
