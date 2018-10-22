import {
  NumberInputNode,
  NumberOutputNode
} from '../../../src/main/nodes/number';
import { createConnection } from '../../../src/main/workspace/connections';
import { createNode } from '../../../src/main/workspace/nodes';
import { addOrUpdateFormValue } from '../../../src/main/workspace/nodes-detail';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { QueryTestCase } from '../../test-utils';

export const workspaceTest: QueryTestCase = {
  id: 'Workspace',
  query: `
    query Workspace($id: ID!) {
      workspace(id: $id) {
        id
        name
        lastChange
        created
        description
        nodes {
          id
          type
          x
          y
          inputs {
            name
            connectionId
          }
          outputs {
            name
            connectionId
          }
          contextIds
          state
          form
          workspace {
            id
          }
          metaInputs
          metaOutputs
          hasContextFn
          progress
          inputSockets
          outputSockets
        }
        results {
          id
        }
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
          contextIds
        }
        state
      }
    }
  `,
  beforeTest: async reqContext => {
    const ws = await createWorkspace(
      'WS1',
      reqContext,
      'This is a description'
    );
    const a = await createNode(
      NumberInputNode.type,
      ws.id,
      [],
      1,
      2,
      reqContext
    );
    const o = await createNode(
      NumberOutputNode.type,
      ws.id,
      [],
      7,
      8,
      reqContext
    );

    await createConnection(
      { name: 'value', nodeId: a.id },
      { name: 'value', nodeId: o.id },
      reqContext
    );
    await Promise.all([
      addOrUpdateFormValue(a.id, 'value', JSON.stringify(1), reqContext),
      addOrUpdateFormValue(
        o.id,
        'name',
        JSON.stringify('Straight through'),
        reqContext
      )
    ]);
    return { variables: { id: ws.id } };
  },
  expected: {
    workspace: {
      connections: expect.arrayContaining([
        {
          contextIds: [],
          from: { name: 'value', nodeId: expect.any(String) },
          id: expect.any(String),
          to: { name: 'value', nodeId: expect.any(String) }
        }
      ]),
      created: expect.any(Number),
      description: 'This is a description',
      id: expect.any(String),
      lastChange: expect.any(Number),
      name: 'WS1',
      nodes: expect.arrayContaining([
        {
          contextIds: [],
          form: { value: 1 },
          hasContextFn: false,
          id: expect.any(String),
          inputSockets: {},
          inputs: [],
          metaInputs: {},
          metaOutputs: { value: { content: {}, isPresent: true } },
          outputSockets: {
            value: {
              dataType: 'Number',
              displayName: 'Number',
              state: 'Static'
            }
          },
          outputs: [{ connectionId: expect.any(String), name: 'value' }],
          progress: null,
          state: 'VALID',
          type: 'NumberInput',
          workspace: { id: expect.any(String) },
          x: 1,
          y: 2
        },
        {
          contextIds: [],
          form: { name: 'Straight through' },
          hasContextFn: false,
          id: expect.any(String),
          inputSockets: {
            value: {
              dataType: 'Number',
              displayName: 'Number',
              state: 'Static'
            }
          },
          inputs: [{ connectionId: expect.any(String), name: 'value' }],
          metaInputs: { value: { content: {}, isPresent: true } },
          metaOutputs: {},
          outputSockets: {},
          outputs: [],
          progress: null,
          state: 'VALID',
          type: 'NumberOutput',
          workspace: { id: expect.any(String) },
          x: 7,
          y: 8
        }
      ]),
      results: [],
      state: 'VALID'
    }
  }
};
