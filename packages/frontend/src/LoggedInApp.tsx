import * as React from 'react';

import { Colors } from '@masterthesis/shared';
import { Layout } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import { AppMenu } from './components/AppMenu';
import DataPage from './pages/DataPage';
import DetailPage from './pages/dataset/DetailPage';
import StartPage from './pages/StartPage';
import UserPage from './pages/UserPage';
import WorkspaceDetailPage from './pages/workspaces/DetailPage';
import WorkspacesPage from './pages/WorkspacesPage';

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
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={this.onCollapse}
          breakpoint="md"
          style={{ color: Colors.GrayLight }}
        >
          <Query query={MENU_QUERY}>
            {res => {
              if (res.loading || res.error) {
                return <AppMenu collapsed={collapsed} />;
              }

              return (
                <AppMenu
                  datasets={res.data!.datasets}
                  workspaces={res.data!.workspaces}
                  collapsed={collapsed}
                />
              );
            }}
          </Query>
        </Sider>
        <Content
          style={{ backgroundColor: Colors.Background, padding: '16px' }}
        >
          <Switch>
            <Route exact path="/" component={StartPage} />
            <Route exact path="/data" component={DataPage} />
            <Route path="/data/:id" component={DetailPage} />
            <Route exact path="/workspaces" component={WorkspacesPage} />
            <Route path="/workspaces/:id" component={WorkspaceDetailPage} />
            <Route exact path="/user" component={UserPage} />
          </Switch>
        </Content>
      </Layout>
    );
  }
}

export default withRouter(LoggedInApp);
