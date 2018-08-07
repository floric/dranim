import * as React from 'react';

import { Colors } from '@masterthesis/shared';
import { Layout } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import { AppMenu } from './components/AppMenu';
import { LoadingCard } from './components/CustomCards';
import { getAsyncPage } from './utils/async';

const WorkspacesPage = getAsyncPage(() => import('./pages/WorkspacesPage'));
const WorkspaceDetailPage = getAsyncPage(() =>
  import('./pages/workspaces/DetailPage')
);
const StartPage = getAsyncPage(() => import('./pages/StartPage'));
const DatasetDetailPage = getAsyncPage(() =>
  import('./pages/dataset/DetailPage')
);
const DataPage = getAsyncPage(() => import('./pages/DataPage'));

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

class LoggedInApp extends React.Component<
  LoggedInAppProps,
  { collapsed: boolean }
> {
  public componentWillMount() {
    this.setState({
      collapsed: false
    });
  }

  private onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  };

  public render() {
    const { collapsed } = this.state;

    return (
      <Query query={MENU_QUERY}>
        {res => {
          if (res.loading || res.error) {
            return <LoadingCard text="Loading App..." />;
          }

          return (
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
                  datasets={res.data!.datasets}
                  workspaces={res.data!.workspaces}
                  collapsed={collapsed}
                />
              </Sider>
              <Content
                style={{ backgroundColor: Colors.Background, padding: '16px' }}
              >
                <Switch>
                  <Route exact path="/" component={StartPage} />
                  <Route exact path="/data" component={DataPage} />
                  <Route path="/data/:id" component={DatasetDetailPage} />
                  <Route exact path="/workspaces" component={WorkspacesPage} />
                  <Route
                    path="/workspaces/:workspaceId"
                    component={WorkspaceDetailPage}
                  />
                </Switch>
              </Content>
            </Layout>
          );
        }}
      </Query>
    );
  }
}

export default withRouter(LoggedInApp);
