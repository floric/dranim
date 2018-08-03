import * as React from 'react';

import {
  CalculationProcess,
  ProcessState,
  SocketInstance
} from '@masterthesis/shared';
import { ApolloQueryResult } from 'apollo-client';
import { distanceInWordsToNow } from 'date-fns';
import { Mutation, MutationFn, Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import { AsyncButton } from '../../components/AsyncButton';
import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
import { ExplorerEditor } from '../../explorer/ExplorerEditor';
import {
  ADD_OR_UPDATE_FORM_VALUE,
  CREATE_CONNECTION,
  CREATE_NODE,
  DELETE_CONNECTION,
  DELETE_NODE,
  START_CALCULATION,
  STOP_CALCULATION,
  UPDATE_NODE,
  WORKSPACE_NODE_SELECTION
} from '../../graphql/editor-page';
import {
  deepCopyResponse,
  showNotificationWithIcon,
  tryOperation
} from '../../utils/form';

const POLLING_FREQUENCY = 5000;

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

  private renderCalculationProcessCard = (
    currentCalculation: CalculationProcess
  ) => (
    <Mutation mutation={STOP_CALCULATION}>
      {stopCalculation => (
        <LoadingCard text="Calculation in progress...">
          <p>
            {`Processed ${currentCalculation.processedOutputs} of ${
              currentCalculation.totalOutputs
            } nodes | Started ${distanceInWordsToNow(currentCalculation.start, {
              includeSeconds: true,
              addSuffix: true
            })}`}
          </p>
          <AsyncButton
            type="danger"
            icon="close"
            fullWidth={false}
            onClick={async () => {
              await stopCalculation({
                variables: { id: currentCalculation.id }
              });
              showNotificationWithIcon({
                icon: 'info',
                title: 'Calculation will be stopped',
                content: 'Please wait until the calculation has been stopped'
              });
            }}
          >
            Stop Calculation
          </AsyncButton>
        </LoadingCard>
      )}
    </Mutation>
  );

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
            return this.renderCalculationProcessCard(inprocessCalculations[0]);
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
