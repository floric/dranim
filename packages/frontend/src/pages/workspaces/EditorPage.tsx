import React, { Component } from 'react';

import {
  GQLCalculationProcess,
  GQLDataset,
  GQLWorkspace,
  ProcessState,
  SocketInstance
} from '@masterthesis/shared';
import { ApolloQueryResult } from 'apollo-client';
import { Mutation, MutationFn } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { CustomErrorCard } from '../../components/layout/CustomCards';
import { ExplorerEditor } from '../../explorer/ExplorerEditor';
import {
  ADD_OR_UPDATE_FORM_VALUE,
  CREATE_CONNECTION,
  CREATE_NODE,
  DATASETS,
  DELETE_CONNECTION,
  DELETE_NODE,
  START_CALCULATION,
  UPDATE_NODE,
  WORKSPACE_NODE_SELECTION
} from '../../graphql/editor-page';
import { deepCopyResponse, tryOperation } from '../../utils/form';
import { ProcessRunningCard } from './components/ProcessRunningCard';

const POLLING_FREQUENCY = 5000;

export interface WorkspaceEditorPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

export default class WorkspaceEditorPage extends Component<
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
      <HandledQuery<{
        datasets: Array<GQLDataset>;
      }>
        query={DATASETS}
      >
        {dsData => (
          <HandledQuery<
            {
              workspace: GQLWorkspace | null;
              calculations: Array<GQLCalculationProcess>;
            },
            { workspaceId: string }
          >
            query={WORKSPACE_NODE_SELECTION}
            variables={{ workspaceId }}
          >
            {({
              data: { workspace, calculations },
              refetch,
              startPolling,
              stopPolling
            }) => {
              if (!workspace) {
                return (
                  <CustomErrorCard
                    title="Unknown workspace"
                    description="Workspace doesn't exist."
                  />
                );
              }

              const inprocessCalculations = calculations.filter(
                n => n.state === ProcessState.PROCESSING
              );

              if (inprocessCalculations.length > 0) {
                startPolling(POLLING_FREQUENCY);
                return (
                  <ProcessRunningCard
                    currentCalculation={inprocessCalculations[0]}
                  />
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
                                              datasets={dsData.data.datasets}
                                              connections={deepCopyResponse(
                                                workspace.connections
                                              )}
                                              nodes={deepCopyResponse(
                                                workspace.nodes
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
          </HandledQuery>
        )}
      </HandledQuery>
    );
  }
}
