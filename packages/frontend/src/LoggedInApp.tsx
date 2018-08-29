import { Colors, GQLDataset, GQLWorkspace } from '@masterthesis/shared';
import { Layout } from 'antd';
import gql from 'graphql-tag';
import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import { AppMenu } from './components/AppMenu';
import { HandledQuery } from './components/HandledQuery';
import { getAsyncPage } from './utils/async';

const WorkspacesPage = getAsyncPage(() => import('./pages/WorkspacesPage'));
const WorkspaceDetailPage = getAsyncPage(() =>
  import('./pages/workspaces/DetailPage')
);
const StartPage = getAsyncPage(() => import('./pages/StartPage'));
const DatasetDetailPage = getAsyncPage(() =>
  import('./pages/dataset/DetailPage')
);
const DatasetsPage = getAsyncPage(() => import('./pages/DatasetsPage'));

const { Content, Sider } = Layout;

export interface LoggedInAppProps extends RouteComponentProps<{}, {}> {}

const MENU_QUERY = gql`
  {
    datasets {
      id
      name
    }
    workspaces {
      id
      name
    }
  }
`;
export type LoggedInAppState = { collapsed: boolean };

class LoggedInApp extends React.Component<LoggedInAppProps, LoggedInAppState> {
  public state: LoggedInAppState = {
    collapsed: false
  };

  private onCollapse = (collapsed: boolean) => this.setState({ collapsed });

  public render() {
    const { collapsed } = this.state;

    return (
      <HandledQuery<{
        datasets: Array<GQLDataset>;
        workspaces: Array<GQLWorkspace>;
      }>
        query={MENU_QUERY}
      >
        {({ data: { workspaces, datasets } }) => (
          <Layout style={{ minHeight: '100vh' }}>
            <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={this.onCollapse}
              breakpoint="md"
              theme="dark"
              style={{ color: Colors.GrayLight }}
            >
              <AppMenu
                datasets={datasets}
                workspaces={workspaces}
                collapsed={collapsed}
              />
            </Sider>
            <Content
              style={{ backgroundColor: Colors.Background, padding: '16px' }}
            >
              <Switch>
                <Route exact path="/" component={StartPage} />
                <Route exact path="/data" component={DatasetsPage} />
                <Route path="/data/:id" component={DatasetDetailPage} />
                <Route exact path="/workspaces" component={WorkspacesPage} />
                <Route
                  path="/workspaces/:workspaceId"
                  component={WorkspaceDetailPage}
                />
              </Switch>
            </Content>
          </Layout>
        )}
      </HandledQuery>
    );
  }
}

export default withRouter(LoggedInApp);
