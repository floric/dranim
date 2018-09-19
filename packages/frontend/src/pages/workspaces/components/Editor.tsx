import React, { Component } from 'react';

import {
  GQLCalculationProcess,
  GQLDataset,
  GQLNodeInstance,
  GQLWorkspace,
  ProcessState
} from '@masterthesis/shared';
import { adopt } from 'react-adopt';
import { Mutation } from 'react-apollo';

import { ExplorerEditor } from '../../../explorer/ExplorerEditor';
import {
  handleAddOrUpdateFormValue,
  handleConnectionCreate,
  handleConnectionDelete,
  handleNodeCreate,
  handleNodeDelete,
  handleNodeUpdate,
  handleStartCalculation
} from '../../../graphql/editor-mutations';
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

const POLLING_FREQUENCY = 1000;
const POLLING_FALLOF = 1.1;

export type EditorProps = {
  workspace: GQLWorkspace;
  calculations: Array<GQLCalculationProcess>;
  datasets: Array<GQLDataset>;
  nodes: Array<GQLNodeInstance>;
  refetchCalculations: () => Promise<any>;
  refreshAll: () => Promise<any>;
};

type EditorState = {
  currentFrequency: number;
  isPolling: boolean;
};

const getNotificationIcon = (state: ProcessState) =>
  state === ProcessState.SUCCESSFUL || state === ProcessState.CANCELED
    ? 'success'
    : 'error';
const getNotificationContent = (state: ProcessState) =>
  state === ProcessState.SUCCESSFUL
    ? 'Calculation finished successfully.'
    : state === ProcessState.CANCELED
      ? 'Calculation canceled successfully.'
      : 'Calculation has failed.';

const getNotificationTitle = (state: ProcessState) =>
  state === ProcessState.SUCCESSFUL
    ? 'Calculation finished.'
    : state === ProcessState.CANCELED
      ? 'Calculation canceled.'
      : 'Calculation failed.';

const getRunningCalculations = (calculations: Array<GQLCalculationProcess>) =>
  calculations.filter(n => n.state === ProcessState.PROCESSING);

export class Editor extends Component<EditorProps, EditorState> {
  public state: EditorState = {
    currentFrequency: POLLING_FREQUENCY,
    isPolling: false
  };

  public componentDidMount() {
    this.increaseTimeout();
  }

  private increaseTimeout = async () => {
    const { currentFrequency } = this.state;
    const { refetchCalculations, calculations } = this.props;
    const runningCalcs = getRunningCalculations(calculations);
    if (runningCalcs.length === 0) {
      return;
    }

    this.setState({
      currentFrequency: currentFrequency * POLLING_FALLOF,
      isPolling: true
    });

    await refetchCalculations();
    await sleep(currentFrequency);
    this.increaseTimeout();
  };

  public componentDidUpdate() {
    const { refreshAll, calculations } = this.props;
    const { isPolling } = this.state;
    const runningCalcs = getRunningCalculations(calculations);
    if (runningCalcs.length === 0 && isPolling) {
      this.setState({ isPolling: false });
      const state = calculations[calculations.length - 1].state;
      showNotificationWithIcon({
        title: getNotificationTitle(state),
        content: getNotificationContent(state),
        icon: getNotificationIcon(state)
      });
      refreshAll();
    }
  }

  public render() {
    const {
      workspace,
      workspace: { id },
      nodes,
      calculations,
      datasets
    } = this.props;
    const runningCalcs = getRunningCalculations(calculations);
    if (runningCalcs.length > 0) {
      return (
        <ProcessRunningCard
          nodes={nodes}
          currentCalculation={runningCalcs[0]}
        />
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
            datasets={datasets}
            workspace={workspace}
            onNodeCreate={handleNodeCreate(createNode, id)}
            onNodeDelete={handleNodeDelete(deleteNode, id)}
            onNodeUpdate={handleNodeUpdate(updateNodePosition, id)}
            onConnectionCreate={handleConnectionCreate(createConnection, id)}
            onConnectionDelete={handleConnectionDelete(deleteConnection, id)}
            onAddOrUpdateFormValue={handleAddOrUpdateFormValue(
              addOrUpdateFormValue,
              id
            )}
            onStartCalculation={async () => {
              await handleStartCalculation(startCalculation, id)();
              await this.increaseTimeout();
            }}
          />
        )}
      </ComposedMutations>
    );
  }
}

const sleep = (ms: number) => new Promise(resolve => setInterval(resolve, ms));
