import React, { Component } from 'react';

import {
  GQLCalculationProcess,
  GQLDataset,
  GQLWorkspace,
  ProcessState
} from '@masterthesis/shared';
import { adopt } from 'react-adopt';
import { Mutation } from 'react-apollo';

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
import { showNotificationWithIcon } from '../../../utils/form';
import {
  handleAddOrUpdateFormValue,
  handleConnectionCreate,
  handleConnectionDelete,
  handleNodeCreate,
  handleNodeDelete,
  handleNodeUpdate,
  handleStartCalculation
} from '../utils/editor-mutations';
import { ProcessRunningCard } from './ProcessRunningCard';

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

const POLLING_FREQUENCY = 5000;

export type EditorProps = {
  workspace: GQLWorkspace;
  calculations: Array<GQLCalculationProcess>;
  datasets: Array<GQLDataset>;
  workspaceId: string;
  startCalculationPolling: (msFrequency: number) => void;
  stopCalculationPolling: () => void;
  refreshAll: () => Promise<any>;
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
    const {
      stopCalculationPolling,
      startCalculationPolling,
      refreshAll,
      calculations
    } = props;
    const { isPolling } = this.state;
    if (this.runningCalculations.length === 0 && isPolling) {
      this.setState({ isPolling: false });
      const state = calculations[calculations.length - 1].state;
      showNotificationWithIcon({
        title: 'Calculation finished',
        content: getNotificationContent(state),
        icon: getNotificationIcon(state)
      });
      stopCalculationPolling();
      refreshAll();
    } else if (this.runningCalculations.length > 0 && !isPolling) {
      this.setState({
        isPolling: true
      });
      startCalculationPolling(POLLING_FREQUENCY);
    }
  }

  public render() {
    const {
      datasets,
      workspace,
      workspaceId,
      startCalculationPolling
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
            onNodeCreate={handleNodeCreate(createNode, workspaceId)}
            onNodeDelete={handleNodeDelete(deleteNode, workspaceId)}
            onNodeUpdate={handleNodeUpdate(updateNodePosition, workspaceId)}
            onConnectionCreate={handleConnectionCreate(
              createConnection,
              workspaceId
            )}
            onConnectionDelete={handleConnectionDelete(
              deleteConnection,
              workspaceId
            )}
            onAddOrUpdateFormValue={handleAddOrUpdateFormValue(
              addOrUpdateFormValue,
              workspaceId
            )}
            onStartCalculation={handleStartCalculation(
              startCalculation,
              startCalculationPolling,
              workspaceId,
              POLLING_FREQUENCY
            )}
          />
        )}
      </ComposedMutations>
    );
  }
}
