import * as React from 'react';

import { Tabs } from 'antd';
import { RouteComponentProps } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import { PageHeaderCard } from '../../components/PageHeaderCard';
import WorkspaceCalculationsPage from './WorkspaceCalculationsPage';
import WorkspaceEditorPage from './WorkspaceEditorPage';

export interface IWorkspacesPageProps
  extends RouteComponentProps<{ id: string }> {}

export default class WorkspacesPage extends React.Component<
  IWorkspacesPageProps
> {
  public render() {
    return (
      <>
        <PageHeaderCard title="Workspace" />
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
          <Tabs.TabPane forceRender tab="Calculations" key="calculations" />
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
  }
}
