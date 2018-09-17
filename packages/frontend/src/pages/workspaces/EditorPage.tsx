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
        refetch
      },
      calculations: {
        data: { calculations },
        startPolling,
        stopPolling
      }
    }) => {
      if (!workspace) {
        return <UnknownWorkspaceCard history={history} />;
      }

      return (
        <Editor
          refreshAll={refetch}
          startCalculationPolling={startPolling}
          stopCalculationPolling={stopPolling}
          calculations={calculations}
          datasets={datasets}
          workspace={workspace}
          workspaceId={workspaceId}
        />
      );
    }}
  </ComposedQueries>
);

export default WorkspaceEditorPage;
