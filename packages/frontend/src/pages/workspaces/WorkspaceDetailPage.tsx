import * as React from 'react';
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
