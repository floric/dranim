import React, { SFC } from 'react';

import {
  GQLCalculationProcess,
  GQLDataset,
  GQLWorkspace
} from '@masterthesis/shared';
import { adopt } from 'react-adopt';
import { QueryResult } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { DATASETS, WORKSPACE_NODE_SELECTION } from '../../graphql/editor-page';
import { Editor } from './components/Editor';
import { UnknownWorkspaceCard } from './DetailPage';

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
    <HandledQuery<DatasetsResult> query={DATASETS}>{render}</HandledQuery>
  ),
  selectedNode: ({ render, workspaceId }) => (
    <HandledQuery<SelectedNodeResult, { workspaceId: string }>
      query={WORKSPACE_NODE_SELECTION}
      variables={{ workspaceId }}
    >
      {render}
    </HandledQuery>
  )
});

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

      return (
        <Editor
          startPolling={startPolling}
          stopPolling={stopPolling}
          calculations={calculations}
          datasets={datasets}
          refetch={refetch}
          workspace={workspace}
          workspaceId={workspaceId}
        />
      );
    }}
  </ComposedQueries>
);

export default WorkspaceEditorPage;
