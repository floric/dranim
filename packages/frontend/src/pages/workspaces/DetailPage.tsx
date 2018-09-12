import React, { SFC } from 'react';

import {
  GQLCalculationProcess,
  GQLWorkspace,
  NodeState
} from '@masterthesis/shared';
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
      state
      nodes {
        id
      }
      connections {
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

const getCurrentStep = (
  calculations: Array<GQLCalculationProcess>,
  workspace: GQLWorkspace
) => {
  if (calculations.length > 0) {
    return 4;
  }

  if (workspace.nodes.length === 0) {
    return 1;
  } else if (
    workspace.state === NodeState.INVALID ||
    workspace.connections.length === 0
  ) {
    return 2;
  }

  return 3;
};

const HelpSteps: SFC<{
  calculations: Array<GQLCalculationProcess>;
  workspace: GQLWorkspace;
}> = ({ calculations, workspace }) => {
  const step = getCurrentStep(calculations, workspace);
  return step < 4 ? (
    <>
      <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
      <Steps current={step} size="small">
        <Steps.Step title="Workspace created" />
        <Steps.Step title={step < 2 ? 'Add Nodes' : 'Nodes added'} />
        <Steps.Step
          title={step < 3 ? 'Connect and configure Nodes' : 'Nodes connected'}
        />
        <Steps.Step title="Start Calculation" />
      </Steps>
    </>
  ) : null;
};

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
    {({ data: { workspace, calculations } }) => {
      if (!workspace) {
        return <UnknownWorkspaceCard history={history} />;
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
                            variables: { id: workspace.id, name },
                            awaitRefetchQueries: true,
                            refetchQueries: [
                              {
                                query: WORKSPACE,
                                variables: { id: workspaceId }
                              }
                            ]
                          }),
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
                  <HelpSteps
                    calculations={calculations}
                    workspace={workspace}
                  />
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
