import React, { SFC } from 'react';

import { GQLWorkspace } from '@masterthesis/shared';
import { css } from 'glamor';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { CustomErrorCard } from '../../components/layout/CustomCards';
import { PageHeaderCard } from '../../components/layout/PageHeaderCard';
import { EditableText } from '../../components/properties/EditableText';
import { RoutedTabs } from '../../components/RoutedTabs';
import { tryOperation } from '../../utils/form';
import WorkspaceCalculationsPage from './CalculationsPage';
import WorkspaceEditorPage from './EditorPage';
import VisDetailPage from './VisDetailPage';

const WORKSPACE = gql`
  query workspace($id: String!) {
    workspace(id: $id) {
      id
      name
    }
  }
`;

const RENAME_WORKSPACE = gql`
  mutation renameWorkspace($id: String!, $name: String!) {
    renameWorkspace(id: $id, name: $name)
  }
`;

export interface WorkspacesPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const WorkspacesPage: SFC<WorkspacesPageProps> = ({
  match: {
    params: { workspaceId }
  },
  match,
  location,
  history
}) => (
  <HandledQuery<{ workspace: GQLWorkspace | null }, { id: string }>
    query={WORKSPACE}
    variables={{ id: workspaceId }}
  >
    {({ data: { workspace }, refetch }) => {
      if (!workspace) {
        return (
          <CustomErrorCard
            title="Unknown workspace"
            description="Workspace doesn't exist."
          />
        );
      }

      return (
        <div
          {...css({
            display: 'flex',
            minHeight: '100%',
            flexDirection: 'column'
          })}
        >
          <Mutation mutation={RENAME_WORKSPACE}>
            {renameWorkspace => (
              <PageHeaderCard
                title={
                  <EditableText
                    text={workspace.name}
                    onChange={name =>
                      tryOperation({
                        op: () =>
                          renameWorkspace({
                            variables: { id: workspace.id, name }
                          }),
                        refetch,
                        successTitle: () => 'Name updated',
                        successMessage: () => `Name updated successfully.`,
                        failedTitle: 'Name update failed',
                        failedMessage: `Name not updated.`
                      })
                    }
                  />
                }
                typeTitle="Workspace"
                helpContent={
                  <p>
                    Each Workspace contains an <strong>Explorer</strong> for
                    data manipulation and creating outputs from the given data.
                    Outputs are shown in the Results tab.
                  </p>
                }
              />
            )}
          </Mutation>
          <RoutedTabs
            match={match}
            history={history}
            location={location}
            panes={[
              {
                name: 'Editor',
                key: 'editor',
                content: (
                  <WorkspaceEditorPage {...{ match, location, history }} />
                )
              },
              {
                name: 'Calculations',
                key: 'calculations',
                content: (
                  <WorkspaceCalculationsPage
                    {...{ match, location, history }}
                  />
                )
              },
              {
                name: 'Results',
                key: 'results',
                content: <VisDetailPage {...{ match, location, history }} />
              }
            ]}
            defaultKey="editor"
          />
        </div>
      );
    }}
  </HandledQuery>
);

export default WorkspacesPage;
