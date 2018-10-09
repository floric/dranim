import gql from 'graphql-tag';
import { MutationFn } from 'react-apollo';

import { SocketInstance } from '@masterthesis/shared';
import { tryOperation } from '../utils/form';

export const handleStartCalculation = (
  startCalculation: MutationFn<any, any>,
  workspaceId: string
) => () =>
  tryOperation({
    op: () =>
      startCalculation({
        variables: { workspaceId },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: gql`
              query workspace($workspaceId: ID!) {
                calculations(workspaceId: $workspaceId) {
                  id
                  start
                  state
                }
              }
            `,
            variables: { workspaceId }
          }
        ]
      }),
    successTitle: () => 'Process started',
    successMessage: () => 'This might take several minutes',
    failedTitle: 'Process start has failed'
  });

export const handleNodeCreate = (
  createNode: MutationFn<any, any>,
  workspaceId: string
) => (type: string, x: number, y: number, contextIds: Array<string>) =>
  tryOperation({
    op: () =>
      createNode({
        variables: {
          type,
          x,
          y,
          contextIds,
          workspaceId
        },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: gql`
              query workspace($workspaceId: ID!) {
                workspace(id: $workspaceId) {
                  id
                  state
                  nodes {
                    id
                    type
                    x
                    y
                    state
                    contextIds
                    progress
                    inputs {
                      name
                      connectionId
                    }
                    outputs {
                      name
                      connectionId
                    }
                    form
                    metaInputs
                    hasContextFn
                    inputSockets
                    outputSockets
                  }
                }
              }
            `,
            variables: { workspaceId }
          }
        ]
      }),
    successTitle: null,
    failedTitle: 'Node not created'
  });

export const handleNodeDelete = (
  deleteNode: MutationFn<any, any>,
  workspaceId: string
) => (nodeId: string) =>
  tryOperation({
    op: () =>
      deleteNode({
        variables: { id: nodeId },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: gql`
              query workspace($workspaceId: ID!) {
                workspace(id: $workspaceId) {
                  id
                  state
                  nodes {
                    id
                    state
                    inputs {
                      name
                      connectionId
                    }
                    outputs {
                      name
                      connectionId
                    }
                    form
                    metaInputs
                    inputSockets
                    outputSockets
                  }
                  connections {
                    id
                  }
                }
              }
            `,
            variables: { workspaceId }
          }
        ]
      }),
    successTitle: null,
    failedTitle: 'Node not deleted'
  });

export const handleNodeUpdate = (
  updateNodePosition: MutationFn<any, any>,
  workspaceId: string
) => (nodeId: string, x: number, y: number) =>
  tryOperation({
    op: () =>
      updateNodePosition({
        variables: {
          id: nodeId,
          x,
          y
        },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: gql`
              query workspace($workspaceId: ID!) {
                workspace(id: $workspaceId) {
                  id
                  nodes {
                    id
                    x
                    y
                  }
                }
              }
            `,
            variables: { workspaceId }
          }
        ]
      }),
    successTitle: null,
    failedTitle: 'Node not updated'
  });

export const handleConnectionCreate = (
  createConnection: MutationFn<any, any>,
  workspaceId: string
) => (from: SocketInstance, to: SocketInstance) =>
  tryOperation({
    op: () =>
      createConnection({
        variables: {
          input: { from, to }
        },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: gql`
              query workspace($workspaceId: ID!) {
                workspace(id: $workspaceId) {
                  id
                  state
                  nodes {
                    id
                    state
                    inputs {
                      name
                      connectionId
                    }
                    outputs {
                      name
                      connectionId
                    }
                    form
                    metaInputs
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
                }
              }
            `,
            variables: { workspaceId }
          }
        ]
      }),
    successTitle: null,
    failedTitle: 'Connection not created'
  });

export const handleConnectionDelete = (
  deleteConnection: MutationFn<any, any>,
  workspaceId: string
) => (connId: string) =>
  tryOperation({
    op: () =>
      deleteConnection({
        variables: { id: connId },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: gql`
              query workspace($workspaceId: ID!) {
                workspace(id: $workspaceId) {
                  id
                  state
                  nodes {
                    id
                    state
                    inputs {
                      name
                      connectionId
                    }
                    outputs {
                      name
                      connectionId
                    }
                    metaInputs
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
                }
              }
            `,
            variables: { workspaceId }
          }
        ]
      }),
    successTitle: null,
    failedTitle: 'Connection not deleted'
  });

export const handleAddOrUpdateFormValue = (
  addOrUpdateFormValue: MutationFn<any, any>,
  workspaceId: string
) => (nodeId: string, name: string, value: string) =>
  tryOperation({
    op: () =>
      addOrUpdateFormValue({
        variables: {
          nodeId,
          name,
          value
        },
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: gql`
              query workspace($workspaceId: ID!) {
                workspace(id: $workspaceId) {
                  id
                  state
                  nodes {
                    id
                    state
                    form
                    metaInputs
                    inputSockets
                    outputSockets
                  }
                }
              }
            `,
            variables: { workspaceId }
          }
        ]
      }),
    successTitle: null,
    failedTitle: 'Value not changed'
  });
