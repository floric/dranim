import React, { SFC } from 'react';

import {
  GQLCalculationProcess,
  GQLWorkspace,
  NodeState
} from '@masterthesis/shared';
import { Divider, Steps } from 'antd';
import { css } from 'glamor';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { PageHeaderCard } from '../../components/layout/PageHeaderCard';
import { EditableText } from '../../components/properties/EditableText';
import { RoutedTabs } from '../../components/RoutedTabs';
import { nodeTypes } from '../../explorer/nodes/all-nodes';
import { tryMutation } from '../../utils/form';
import { UnknownWorkspaceCard } from './components/UnknownWorkspaceCard';

import WorkspaceCalculationsPage from './CalculationsPage';
import WorkspaceEditorPage from './EditorPage';
import VisDetailPage from './VisDetailPage';

const WORKSPACE = gql`
  query workspace($id: ID!) {
    workspace(id: $id) {
      id
      name
      state
      nodes {
        id
        type
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
  mutation renameWorkspace($id: ID!, $name: String!) {
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
  } else if (
    workspace.nodes
      .map(n => nodeTypes.get(n.type))
      .filter(n => n && n.isOutputNode).length > 0
  ) {
    return 3;
  }

  return 2;
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
                      tryMutation({
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
