import React, { SFC } from 'react';

import { GQLCalculationProcess, GQLWorkspace } from '@masterthesis/shared';
import { Button, Divider, Steps } from 'antd';
import { css } from 'glamor';
import gql from 'graphql-tag';
import { History } from 'history';
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
      nodes {
        id
      }
    }
    calculations(workspaceId: $id) {
      id
    }
  }
`;

const RENAME_WORKSPACE = gql`
  mutation renameWorkspace($id: String!, $name: String!) {
    renameWorkspace(id: $id, name: $name)
  }
`;

export const UnknownWorkspaceCard: SFC<{ history: History }> = ({
  history
}) => (
  <CustomErrorCard
    title="Unknown Workspace"
    description="Workspace doesn't exist."
    actions={
      <Button
        type="primary"
        icon="plus-square"
        onClick={() => history.push('/workspaces')}
      >
        Create Workspace
      </Button>
    }
  />
);

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
  <HandledQuery<
    {
      workspace: GQLWorkspace | null;
      calculations: Array<GQLCalculationProcess>;
    },
    { id: string }
  >
    query={WORKSPACE}
    variables={{ id: workspaceId }}
  >
    {({ data: { workspace, calculations }, refetch }) => {
      if (!workspace) {
        return <UnknownWorkspaceCard history={history} />;
      }

      const step =
        workspace.nodes.length === 0 ? 1 : calculations.length === 0 ? 2 : 3;

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
                endContent={
                  step < 3 ? (
                    <>
                      <Divider
                        style={{ marginTop: '1rem', marginBottom: '1rem' }}
                      />
                      <Steps current={step} size="small">
                        <Steps.Step title="Workspace created" />
                        <Steps.Step
                          title={step === 1 ? 'Add Nodes' : 'Nodes added'}
                        />
                        <Steps.Step title="Start Calculation" />
                      </Steps>
                    </>
                  ) : (
                    undefined
                  )
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
