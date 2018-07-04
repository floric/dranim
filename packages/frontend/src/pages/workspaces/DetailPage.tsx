import * as React from 'react';

import { Tabs } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
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
  extends RouteComponentProps<{ id: string }> {}

export default class WorkspacesPage extends React.Component<
  IWorkspacesPageProps
> {
  public render() {
    return (
      <Query query={WORKSPACE} variables={{ id: this.props.match.params.id }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          if (!data.workspace) {
            return (
              <CustomErrorCard
                title="Unknown workspace"
                description="Workspace doesn't exist."
              />
            );
          }

          return (
            <>
              <PageHeaderCard
                title={data.workspace.name}
                typeTitle="Workspace"
              />
              <Tabs
                onChange={name => {
                  const history = this.props.history;
                  if (name === 'calculations') {
                    history.push(`${this.props.match.url}/calculations`);
                  } else if (name === 'editor') {
                    history.push(`${this.props.match.url}`);
                  } else if (name === 'results') {
                    history.push(`${this.props.match.url}/results`);
                  }
                }}
                type="card"
                animated={{ inkBar: true, tabPane: false }}
                tabBarStyle={{ marginBottom: 0 }}
              >
                <Tabs.TabPane forceRender tab="Editor" key="editor" />
                <Tabs.TabPane
                  forceRender
                  tab="Calculations"
                  key="calculations"
                />
                <Tabs.TabPane forceRender tab="Results" key="results" />
              </Tabs>
              <Switch>
                <Route
                  exact
                  path={`${this.props.match.path}`}
                  component={WorkspaceEditorPage}
                />
                <Route
                  exact
                  path={`${this.props.match.path}/calculations`}
                  component={WorkspaceCalculationsPage}
                />
                <Route
                  exact
                  path={`${this.props.match.path}/results`}
                  component={VisDetailPage}
                />
              </Switch>
            </>
          );
        }}
      </Query>
    );
  }
}
