import React, { SFC } from 'react';

import {
  GQLCalculationProcess,
  GQLDataset,
  GQLWorkspace,
  ProcessState,
  SocketInstance
} from '@masterthesis/shared';
import { ApolloQueryResult } from 'apollo-client';
import { adopt } from 'react-adopt';
import { Mutation, MutationFn, QueryResult } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
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
import { UnknownWorkspaceCard } from './DetailPage';

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

type DatasetsResult = {
  datasets: Array<GQLDataset>;
};

type SelectedNodeResult = {
  workspace: GQLWorkspace | null;
  calculations: Array<GQLCalculationProcess>;
};

const ComposedQueries = adopt<
  {
    datasets: QueryResult<DatasetsResult>;
    selectedNode: QueryResult<SelectedNodeResult>;
  },
  { workspaceId: string }
>({
  datasets: ({ render }) => (
    <HandledQuery<DatasetsResult> query={DATASETS}>
      {dsData => render(dsData)}
    </HandledQuery>
  ),
  selectedNode: ({ render, workspaceId }) => (
    <HandledQuery<SelectedNodeResult, { workspaceId: string }>
      query={WORKSPACE_NODE_SELECTION}
      variables={{ workspaceId }}
    >
      {query => render(query)}
    </HandledQuery>
  )
});

const handleStartCalculation = (
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

const POLLING_FREQUENCY = 5000;

export interface WorkspaceEditorPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const WorkspaceEditorPage: SFC<WorkspaceEditorPageProps> = ({
  history,
  match: {
    params: { workspaceId }
  }
}) => (
  <ComposedQueries workspaceId={workspaceId}>
    {({
      datasets: {
        data: { datasets }
      },
      selectedNode: {
        data: { workspace, calculations },
        refetch,
        startPolling,
        stopPolling
      }
    }) => {
      if (!workspace) {
        return <UnknownWorkspaceCard history={history} />;
      }

      const inprocessCalculations = calculations.filter(
        n => n.state === ProcessState.PROCESSING
      );

      if (inprocessCalculations.length > 0) {
        startPolling(POLLING_FREQUENCY);
        return (
          <ProcessRunningCard currentCalculation={inprocessCalculations[0]} />
        );
      }

      if (inprocessCalculations.length === 0) {
        stopPolling();
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
              connections={deepCopyResponse(workspace.connections)}
              nodes={deepCopyResponse(workspace.nodes)}
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
                refetch,
                workspaceId
              )}
            />
          )}
        </ComposedMutations>
      );
    }}
  </ComposedQueries>
);

export default WorkspaceEditorPage;
