import * as React from 'react';

import { Colors } from '@masterthesis/shared';
import { Layout } from 'antd';
import { css } from 'glamor';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import { AppMenu } from './components/AppMenu';
import DataPage from './pages/DataPage';
import DataDetailPage from './pages/dataset/DataDetailPage';
import StartPage from './pages/StartPage';
import VisPage from './pages/VisPage';
import VisDetailPage from './pages/visualizations/VisDetailPage';
import WorkspaceDetailPage from './pages/workspaces/WorkspaceDetailPage';
import WorkspacesPage from './pages/WorkspacesPage';

const { Content, Footer, Sider } = Layout;

export interface IAppProps extends RouteComponentProps<{}, {}> {}

export const ALL_DATASETS = gql`
  {
    datasets {
      id
      name
      entriesCount
      valueschemas {
        name
      }
    }
    workspaces {
      id
      name
    }
    visualizations {
      id
      name
    }
  }
`;

class App extends React.Component<IAppProps, { collapsed: boolean }> {
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
        <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <div
            className="logo"
            {...css({ color: Colors.GrayLight, padding: '24px' })}
          >
            {!collapsed ? (
              <>
                <span {...css({ fontWeight: '900', fontSize: '150%' })}>
                  Timeseries
                </span>
                <br />
                <span>Explorer</span>
              </>
            ) : null}
          </div>
          <Query query={ALL_DATASETS}>
            {res => {
              if (res.loading || res.error) {
                return <AppMenu collapsed={collapsed} />;
              }

              return (
                <AppMenu
                  visualizations={res.data!.visualizations}
                  datasets={res.data!.datasets}
                  workspaces={res.data!.workspaces}
                  collapsed={collapsed}
                />
              );
            }}
          </Query>
        </Sider>
        <Layout>
          <Content {...css({ background: Colors.Background, padding: '30px' })}>
            <Switch>
              <Route exact path="/" component={StartPage} />
              <Route exact path="/data" component={DataPage} />
              <Route path="/data/:id" component={DataDetailPage} />
              <Route exact path="/workspaces" component={WorkspacesPage} />
              <Route path="/workspaces/:id" component={WorkspaceDetailPage} />
              <Route exact path="/visualizations" component={VisPage} />
              <Route
                exact
                path="/visualizations/:id"
                component={VisDetailPage}
              />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Florian Richter</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(App);
