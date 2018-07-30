import * as React from 'react';

import { ProcessState, SocketInstance } from '@masterthesis/shared';
import { Button } from 'antd';
import { ApolloQueryResult } from 'apollo-client';
import { distanceInWordsToNow } from 'date-fns';
import gql from 'graphql-tag';
import { Mutation, MutationFn, Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
import { ExplorerEditor } from '../../explorer/ExplorerEditor';
import { deepCopyResponse, tryOperation } from '../../utils/form';

const POLLING_FREQUENCY = 5000;

const WORKSPACE_NODE_SELECTION = gql`
  query dataset($workspaceId: String!) {
    datasets {
      id
      name
      entriesCount
      valueschemas {
        name
        unique
        type
      }
    }
    calculations(workspaceId: $workspaceId) {
      id
      start
      state
      processedOutputs
      totalOutputs
    }
    workspace(id: $workspaceId) {
      id
      name
      nodes {
        id
        type
        x
        y
        state
        contextIds
        inputs {
          name
          connectionId
        }
        outputs {
          name
          connectionId
        }
        form {
          name
          value
        }
        metaInputs
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
    }
  }
`;

const CREATE_NODE = gql`
  mutation createNode(
    $type: String!
    $workspaceId: String!
    $contextIds: [String!]!
    $x: Float!
    $y: Float!
  ) {
    createNode(
      type: $type
      workspaceId: $workspaceId
      contextIds: $contextIds
      x: $x
      y: $y
    ) {
      id
      x
      y
      workspace {
        id
      }
      type
    }
  }
`;

const DELETE_NODE = gql`
  mutation deleteNode($id: String!) {
    deleteNode(id: $id)
  }
`;

const UPDATE_NODE = gql`
  mutation updateNodePosition($id: String!, $x: Float!, $y: Float!) {
    updateNodePosition(id: $id, x: $x, y: $y)
  }
`;

const CREATE_CONNECTION = gql`
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
`;

const DELETE_CONNECTION = gql`
  mutation deleteConnection($id: String!) {
    deleteConnection(id: $id)
  }
`;

const ADD_OR_UPDATE_FORM_VALUE = gql`
  mutation addOrUpdateFormValue(
    $nodeId: String!
    $name: String!
    $value: String!
  ) {
    addOrUpdateFormValue(nodeId: $nodeId, name: $name, value: $value)
  }
`;

const START_CALCULATION = gql`
  mutation startCalculation($workspaceId: String!) {
    startCalculation(workspaceId: $workspaceId) {
      id
      start
      state
    }
  }
`;

const STOP_CALCULATION = gql`
  mutation stopCalculation($id: String!) {
    stopCalculation(id: $id)
  }
`;

export interface WorkspaceEditorPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

export class WorkspaceEditorPage extends React.Component<
  WorkspaceEditorPageProps
> {
  private handleNodeCreate = (
    createNode: MutationFn<any, any>,
    workspaceId: string,
    refetch: () => Promise<ApolloQueryResult<any>>
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
          }
        }),
      refetch,
      successTitle: null,
      failedTitle: 'Node not created'
    });

  private handleNodeDelete = (
    deleteNode: MutationFn<any, any>,
    refetch: () => Promise<ApolloQueryResult<any>>
  ) => (nodeId: string) =>
    tryOperation({
      op: () =>
        deleteNode({
          variables: { id: nodeId }
        }),
      refetch,
      successTitle: null,
      failedTitle: 'Node not deleted'
    });

  private handleNodeUpdate = (
    updateNodePosition: MutationFn<any, any>,
    refetch: () => Promise<ApolloQueryResult<any>>
  ) => (nodeId: string, x: number, y: number) =>
    tryOperation({
      op: () =>
        updateNodePosition({
          variables: {
            id: nodeId,
            x,
            y
          }
        }),
      refetch,
      successTitle: null,
      failedTitle: 'Node not updated'
    });

  private handleConnectionCreate = (
    createConnection: MutationFn<any, any>,
    refetch: () => Promise<ApolloQueryResult<any>>
  ) => (from: SocketInstance, to: SocketInstance) =>
    tryOperation({
      op: () =>
        createConnection({
          variables: {
            input: { from, to }
          }
        }),
      refetch,
      successTitle: null,
      failedTitle: 'Connection not created'
    });

  private handleConnectionDelete = (
    deleteConnection: MutationFn<any, any>,
    refetch: () => Promise<ApolloQueryResult<any>>
  ) => (connId: string) =>
    tryOperation({
      op: () =>
        deleteConnection({
          variables: { id: connId }
        }),
      refetch,
      successTitle: null,
      failedTitle: 'Connection not deleted'
    });

  private handleAddOrUpdateFormValue = (
    addOrUpdateFormValue: MutationFn<any, any>,
    refetch: () => Promise<ApolloQueryResult<any>>
  ) => (nodeId, name, value) =>
    tryOperation({
      op: () =>
        addOrUpdateFormValue({
          variables: {
            nodeId,
            name,
            value
          }
        }),
      refetch,
      successTitle: null,
      failedTitle: 'Value not changed'
    });

  private handleStartCalculation = (
    startCalculation: MutationFn<any, any>,
    refetch: () => Promise<ApolloQueryResult<any>>,
    workspaceId: string
  ) => () =>
    tryOperation({
      op: () =>
        startCalculation({
          variables: { workspaceId }
        }),
      refetch,
      successTitle: () => 'Process started',
      successMessage: () => 'This might take several minutes',
      failedTitle: 'Process start has failed'
    });

  public render() {
    const {
      match: {
        params: { workspaceId }
      }
    } = this.props;
    return (
      <Query query={WORKSPACE_NODE_SELECTION} variables={{ workspaceId }}>
        {({ loading, error, data, refetch, startPolling, stopPolling }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          if (!data.workspace) {
            return (
              <CustomErrorCard
                title="Unknown workspace"
                description="Workspace doesn't exist."
              />
            );
          }

          const inprocessCalculations = data.calculations.filter(
            n => n.state === ProcessState.PROCESSING
          );

          if (inprocessCalculations.length > 0) {
            startPolling(POLLING_FREQUENCY);
            const currentCalculation = inprocessCalculations[0];
            return (
              <LoadingCard
                text={`Calculation in progress... Processed ${
                  currentCalculation.processedOutputs
                } of ${
                  currentCalculation.totalOutputs
                } (Started ${distanceInWordsToNow(currentCalculation.start, {
                  includeSeconds: true,
                  addSuffix: true
                })})`}
              >
                <Mutation mutation={STOP_CALCULATION}>
                  {stopCalculation => (
                    <Button
                      onClick={() =>
                        stopCalculation({
                          variables: { id: currentCalculation.id }
                        })
                      }
                    >
                      Stop
                    </Button>
                  )}
                </Mutation>
              </LoadingCard>
            );
          }

          if (inprocessCalculations.length === 0) {
            stopPolling();
          }

          return (
            <Mutation mutation={START_CALCULATION}>
              {startCalculation => (
                <Mutation mutation={ADD_OR_UPDATE_FORM_VALUE}>
                  {addOrUpdateFormValue => (
                    <Mutation mutation={DELETE_CONNECTION}>
                      {deleteConnection => (
                        <Mutation mutation={CREATE_CONNECTION}>
                          {createConnection => (
                            <Mutation mutation={DELETE_NODE}>
                              {deleteNode => (
                                <Mutation mutation={CREATE_NODE}>
                                  {createNode => (
                                    <Mutation mutation={UPDATE_NODE}>
                                      {updateNodePosition => (
                                        <ExplorerEditor
                                          datasets={data.datasets}
                                          connections={deepCopyResponse(
                                            data.workspace.connections
                                          )}
                                          nodes={deepCopyResponse(
                                            data.workspace.nodes
                                          )}
                                          onNodeCreate={this.handleNodeCreate(
                                            createNode,
                                            workspaceId,
                                            refetch
                                          )}
                                          onNodeDelete={this.handleNodeDelete(
                                            deleteNode,
                                            refetch
                                          )}
                                          onNodeUpdate={this.handleNodeUpdate(
                                            updateNodePosition,
                                            refetch
                                          )}
                                          onConnectionCreate={this.handleConnectionCreate(
                                            createConnection,
                                            refetch
                                          )}
                                          onConnectionDelete={this.handleConnectionDelete(
                                            deleteConnection,
                                            refetch
                                          )}
                                          onAddOrUpdateFormValue={this.handleAddOrUpdateFormValue(
                                            addOrUpdateFormValue,
                                            refetch
                                          )}
                                          onStartCalculation={this.handleStartCalculation(
                                            startCalculation,
                                            refetch,
                                            workspaceId
                                          )}
                                        />
                                      )}
                                    </Mutation>
                                  )}
                                </Mutation>
                              )}
                            </Mutation>
                          )}
                        </Mutation>
                      )}
                    </Mutation>
                  )}
                </Mutation>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}
