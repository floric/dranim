import React, { Component } from 'react';

import {
  GQLCalculationProcess,
  GQLDataset,
  GQLWorkspace,
  ProcessState,
  SocketInstance
} from '@masterthesis/shared';
import { ApolloQueryResult } from 'apollo-client';
import { adopt } from 'react-adopt';
import { Mutation, MutationFn } from 'react-apollo';

import { ExplorerEditor } from '../../../explorer/ExplorerEditor';
import {
  ADD_OR_UPDATE_FORM_VALUE,
  CREATE_CONNECTION,
  CREATE_NODE,
  DELETE_CONNECTION,
  DELETE_NODE,
  START_CALCULATION,
  UPDATE_NODE
} from '../../../graphql/editor-page';
import { showNotificationWithIcon, tryOperation } from '../../../utils/form';
import { ProcessRunningCard } from './ProcessRunningCard';

const POLLING_FREQUENCY = 2000;

const ComposedMutations = adopt({
  startCalculation: ({ render }) => (
    <Mutation mutation={START_CALCULATION}>{render}</Mutation>
  ),
  addOrUpdateFormValue: ({ render }) => (
    <Mutation mutation={ADD_OR_UPDATE_FORM_VALUE}>{render}</Mutation>
  ),
  deleteConnection: ({ render }) => (
    <Mutation mutation={DELETE_CONNECTION}>{render}</Mutation>
  ),
  createConnection: ({ render }) => (
    <Mutation mutation={CREATE_CONNECTION}>{render}</Mutation>
  ),
  createNode: ({ render }) => (
    <Mutation mutation={CREATE_NODE}>{render}</Mutation>
  ),
  deleteNode: ({ render }) => (
    <Mutation mutation={DELETE_NODE}>{render}</Mutation>
  ),
  updateNodePosition: ({ render }) => (
    <Mutation mutation={UPDATE_NODE}>{render}</Mutation>
  )
});

const handleStartCalculation = (
  startCalculation: MutationFn<any, any>,
  startPolling: (msFreq: number) => any,
  refetch: () => Promise<any>,
  workspaceId: string
) => () =>
  tryOperation({
    op: async () => {
      await startCalculation({
        variables: { workspaceId }
      });
      await refetch();
      startPolling(POLLING_FREQUENCY);
    },
    successTitle: () => 'Process started',
    successMessage: () => 'This might take several minutes',
    failedTitle: 'Process start has failed'
  });

const handleNodeCreate = (
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

const handleNodeDelete = (
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

const handleNodeUpdate = (
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

const handleConnectionCreate = (
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

const handleConnectionDelete = (
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

const handleAddOrUpdateFormValue = (
  addOrUpdateFormValue: MutationFn<any, any>,
  refetch: () => Promise<ApolloQueryResult<any>>
) => (nodeId: string, name: string, value: string) =>
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

export type EditorProps = {
  workspace: GQLWorkspace;
  calculations: Array<GQLCalculationProcess>;
  datasets: Array<GQLDataset>;
  workspaceId: string;
  startPolling: (msFrequency: number) => void;
  stopPolling: () => void;
  refetch: () => Promise<any>;
};

type EditorState = {
  isPolling: boolean;
};

const getNotificationIcon = (state: ProcessState) =>
  state === ProcessState.SUCCESSFUL
    ? 'success'
    : state === ProcessState.CANCELED
      ? 'info'
      : 'error';
const getNotificationContent = (state: ProcessState) =>
  state === ProcessState.SUCCESSFUL
    ? 'Calculation finished successfully.'
    : state === ProcessState.CANCELED
      ? 'Calculation canceled successfully.'
      : 'Calculation has failed.';

export class Editor extends Component<EditorProps, EditorState> {
  public state: EditorState = { isPolling: false };

  private get runningCalculations() {
    return this.props.calculations.filter(
      n => n.state === ProcessState.PROCESSING
    );
  }

  public componentDidMount() {
    this.startOrStopPolling(this.props);
  }

  public componentWillReceiveProps(nextProps: EditorProps) {
    this.startOrStopPolling(nextProps);
  }

  private startOrStopPolling(props: EditorProps) {
    const { stopPolling, startPolling, calculations } = props;
    const { isPolling } = this.state;
    if (this.runningCalculations.length === 0) {
      if (isPolling) {
        this.setState({ isPolling: false });
        const state = calculations[calculations.length - 1].state;
        showNotificationWithIcon({
          title: 'Calculation finished',
          content: getNotificationContent(state),
          icon: getNotificationIcon(state)
        });
        stopPolling();
      }
    } else {
      this.setState({
        isPolling: true
      });
      startPolling(POLLING_FREQUENCY);
    }
  }

  public render() {
    const {
      datasets,
      workspace,
      workspaceId,
      refetch,
      startPolling
    } = this.props;

    if (this.runningCalculations.length > 0) {
      return (
        <ProcessRunningCard currentCalculation={this.runningCalculations[0]} />
      );
    }

    return (
      <ComposedMutations>
        {({
          addOrUpdateFormValue,
          createConnection,
          createNode,
          deleteConnection,
          deleteNode,
          startCalculation,
          updateNodePosition
        }) => (
          <ExplorerEditor
            workspace={workspace}
            datasets={datasets}
            onNodeCreate={handleNodeCreate(createNode, workspaceId, refetch)}
            onNodeDelete={handleNodeDelete(deleteNode, refetch)}
            onNodeUpdate={handleNodeUpdate(updateNodePosition, refetch)}
            onConnectionCreate={handleConnectionCreate(
              createConnection,
              refetch
            )}
            onConnectionDelete={handleConnectionDelete(
              deleteConnection,
              refetch
            )}
            onAddOrUpdateFormValue={handleAddOrUpdateFormValue(
              addOrUpdateFormValue,
              refetch
            )}
            onStartCalculation={handleStartCalculation(
              startCalculation,
              startPolling,
              refetch,
              workspaceId
            )}
          />
        )}
      </ComposedMutations>
    );
  }
}
