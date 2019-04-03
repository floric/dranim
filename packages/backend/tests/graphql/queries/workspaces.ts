import { startProcess } from '../../../src/main/calculation/start-process';
import {
  NumberInputNode,
  NumberOutputNode,
  SumNode
} from '../../../src/main/nodes/number';
import { createConnection } from '../../../src/main/workspace/connections';
import { createNode } from '../../../src/main/workspace/nodes';
import { addOrUpdateFormValue } from '../../../src/main/workspace/nodes-detail';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { QueryTestCase } from '../../test-utils';
import { InMemoryCache } from '@masterthesis/shared';
import { updateStates } from '../../../src/main/workspace/nodes-state';

export const workspacesTest: QueryTestCase = {
  id: 'Workspaces',
  query: `
    query {
      workspaces {
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
        results {
          id
          value
          type
          name
          description
          visible
          workspaceId
        }
        state
        calculations {
          id
          start
          finish
          state
        }
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
    const b = await createNode(
      NumberInputNode.type,
      ws.id,
      [],
      3,
      4,
      reqContext
    );
    const sum = await createNode(SumNode.type, ws.id, [], 5, 6, reqContext);
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
      { name: 'a', nodeId: sum.id },
      reqContext
    );
    await createConnection(
      { name: 'value', nodeId: b.id },
      { name: 'b', nodeId: sum.id },
      reqContext
    );
    await createConnection(
      { name: 'sum', nodeId: sum.id },
      { name: 'value', nodeId: o.id },
      reqContext
    );
    await Promise.all([
      addOrUpdateFormValue(a.id, 'value', 1, reqContext),
      addOrUpdateFormValue(b.id, 'value', 1, reqContext),
      addOrUpdateFormValue(o.id, 'name', 'Easy task', reqContext)
    ]);
    await startProcess(
      ws.id,
      { ...reqContext, cache: new InMemoryCache() },
      { awaitResult: true }
    );
    await updateStates(ws.id, { ...reqContext, cache: new InMemoryCache() });
    return {};
  },
  expected: {
    workspaces: [
      {
        calculations: [
          {
            finish: expect.any(Number),
            id: expect.any(String),
            start: expect.any(Number),
            state: 'SUCCESSFUL'
          }
        ],
        connections: expect.arrayContaining([
          {
            contextIds: [],
            from: { name: 'value', nodeId: expect.any(String) },
            id: expect.any(String),
            to: { name: 'a', nodeId: expect.any(String) }
          },
          {
            contextIds: [],
            from: { name: 'value', nodeId: expect.any(String) },
            id: expect.any(String),
            to: { name: 'b', nodeId: expect.any(String) }
          },
          {
            contextIds: [],
            from: { name: 'sum', nodeId: expect.any(String) },
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
            x: 3,
            y: 4
          },
          {
            contextIds: [],
            form: {},
            hasContextFn: false,
            id: expect.any(String),
            inputSockets: {
              a: {
                dataType: 'Number',
                displayName: 'Number A',
                state: 'Static'
              },
              b: {
                dataType: 'Number',
                displayName: 'Number B',
                state: 'Static'
              }
            },
            inputs: expect.arrayContaining([
              { connectionId: expect.any(String), name: 'a' },
              { connectionId: expect.any(String), name: 'b' }
            ]),
            metaInputs: {
              a: {
                content: {},
                isPresent: true
              },
              b: {
                content: {},
                isPresent: true
              }
            },
            metaOutputs: { sum: { content: {}, isPresent: true } },
            outputSockets: {
              sum: { dataType: 'Number', displayName: 'Sum', state: 'Static' }
            },
            outputs: [{ connectionId: expect.any(String), name: 'sum' }],
            progress: null,
            state: 'VALID',
            type: 'Sum',
            workspace: { id: expect.any(String) },
            x: 5,
            y: 6
          },
          {
            contextIds: [],
            form: { name: 'Easy task' },
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
        results: [
          {
            description: '',
            id: expect.any(String),
            name: 'Easy task',
            type: 'Number',
            value: 2,
            visible: false,
            workspaceId: expect.any(String)
          }
        ],
        state: 'VALID'
      }
    ]
  }
};
