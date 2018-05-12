import * as React from 'react';
import { Tabs } from 'antd';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';

import WorkspaceEditorPage from './WorkspaceEditorPage';
import WorkspaceCalculationsPage from './WorkspaceCalculationsPage';
import { PageHeaderCard } from '../../components/PageHeaderCard';

export interface IWorkspacesPageProps
  extends RouteComponentProps<{ id: string }> {}

export default class WorkspaceswPage extends React.Component<
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
