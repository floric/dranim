import { QueryTestCase } from '../../test-utils';

export const unknownWorkspaceTest: QueryTestCase = {
  id: 'UnknownWorkspace',
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
  beforeTest: () => Promise.resolve({ variables: { id: 'abc' } }),
  expected: {
    workspace: null
  }
};
