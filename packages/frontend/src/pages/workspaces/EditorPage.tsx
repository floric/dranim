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
import { CALCULATIONS, DASETS_AND_WORKSPACES } from '../../graphql/editor-page';
import { Editor } from './components/Editor';
import { UnknownWorkspaceCard } from './DetailPage';

type DatasetsResult = {
  datasets: Array<GQLDataset>;
  workspace: GQLWorkspace | null;
};

type SelectedNodeResult = {
  calculations: Array<GQLCalculationProcess>;
  workspace: GQLWorkspace | null;
};

const ComposedQueries = adopt<
  {
    all: QueryResult<DatasetsResult>;
    calculations: QueryResult<SelectedNodeResult>;
  },
  { workspaceId: string }
>({
  all: ({ render, workspaceId }) => (
    <HandledQuery<DatasetsResult, { workspaceId: string }>
      query={DASETS_AND_WORKSPACES}
      variables={{ workspaceId }}
    >
      {render}
    </HandledQuery>
  ),
  calculations: ({ render, workspaceId }) => (
    <HandledQuery<SelectedNodeResult, { workspaceId: string }>
      query={CALCULATIONS}
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
      all: {
        data: { workspace, datasets },
        refetch: refetchAll
      },
      calculations: {
        data: {
          calculations,
          workspace: { nodes: progressNodes }
        },
        refetch: refetchCalculations
      }
    }) => {
      if (!workspace) {
        return <UnknownWorkspaceCard history={history} />;
      }

      return (
        <Editor
          refreshAll={refetchAll}
          refetchCalculations={refetchCalculations}
          calculations={calculations}
          nodes={progressNodes}
          datasets={datasets}
          workspace={workspace}
          workspaceId={workspaceId}
        />
      );
    }}
  </ComposedQueries>
);

export default WorkspaceEditorPage;
