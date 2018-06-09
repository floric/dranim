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

const WORKSPACE = gql`
  query dataset($id: String!) {
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
        {({ loading, error, data, refetch }) => {
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
                onChange={a => {
                  const history = this.props.history;
                  if (a === 'calculations') {
                    history.push(`${this.props.match.url}/calculations`);
                  } else if (a === 'editor') {
                    history.push(`${this.props.match.url}`);
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
              </Switch>
            </>
          );
        }}
      </Query>
    );
  }
}
