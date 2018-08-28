import { GQLWorkspace } from '@masterthesis/shared';
import { Tabs } from 'antd';
import { css } from 'glamor';
import gql from 'graphql-tag';
import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { CustomErrorCard } from '../../components/CustomCards';
import { HandledQuery } from '../../components/HandledQuery';
import { PageHeaderCard } from '../../components/PageHeaderCard';
import { WorkspaceCalculationsPage } from './CalculationsPage';
import { WorkspaceEditorPage } from './EditorPage';
import VisDetailPage from './VisDetailPage';

const WORKSPACE = gql`
  query workspace($id: String!) {
    workspace(id: $id) {
      id
      name
    }
  }
`;

export interface IWorkspacesPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const WorkspacesPage: React.SFC<IWorkspacesPageProps> = props => (
  <HandledQuery<{ workspace: GQLWorkspace | null }, { id: string }>
    query={WORKSPACE}
    variables={{ id: props.match.params.workspaceId }}
  >
    {({ data: { workspace } }) => {
      if (!workspace) {
        return (
          <CustomErrorCard
            title="Unknown workspace"
            description="Workspace doesn't exist."
          />
        );
      }

      const {
        match: { url, path },
        history,
        location: { pathname }
      } = props;

      let activeKey = 'editor';
      const pathSegments = pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment === 'calculations') {
        activeKey = 'calculations';
      } else if (lastSegment === 'results') {
        activeKey = 'results';
      }

      return (
        <div
          {...css({
            display: 'flex',
            minHeight: '100%',
            flexDirection: 'column'
          })}
        >
          <PageHeaderCard
            title={workspace.name}
            typeTitle="Workspace"
            helpContent={
              <p>
                Each Workspace contains an <strong>Explorer</strong> for data
                manipulation and creating outputs from the given data. Outputs
                are shown in the Results tab.
              </p>
            }
          />
          <Tabs
            activeKey={activeKey}
            onChange={name => {
              if (name === 'editor') {
                history.push(`${url}`);
              } else if (name === 'calculations') {
                history.push(`${url}/calculations`);
              } else if (name === 'results') {
                history.push(`${url}/results`);
              }
            }}
            type="card"
            animated={{ inkBar: true, tabPane: false }}
            tabBarStyle={{ marginBottom: 0 }}
          >
            <Tabs.TabPane forceRender tab="Editor" key="editor" />
            <Tabs.TabPane forceRender tab="Calculations" key="calculations" />
            <Tabs.TabPane forceRender tab="Results" key="results" />
          </Tabs>
          <Switch>
            <Route exact path={`${path}`} component={WorkspaceEditorPage} />
            <Route
              exact
              path={`${path}/calculations`}
              component={WorkspaceCalculationsPage}
            />
            <Route exact path={`${path}/results`} component={VisDetailPage} />
          </Switch>
        </div>
      );
    }}
  </HandledQuery>
);

export default WorkspacesPage;
