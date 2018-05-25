import * as React from 'react';
import { SFC } from 'react';

import { Workspace } from '@masterthesis/shared';
import { Icon, Layout, Menu } from 'antd';
import { css } from 'glamor';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { NavLink, Route, Switch } from 'react-router-dom';

import DataDetailPage from './pages/DataDetailPage';
import DataPage from './pages/DataPage';
import StartPage from './pages/StartPage';
import VisPage from './pages/VisPage';
import WorkspaceDetailPage from './pages/workspaces/WorkspaceDetailPage';
import WorkspacesOverviewPage from './pages/WorkspacesOverviewPage';

const { Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

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
  }
`;

const MenuItemContent: SFC<{
  collapsed: boolean;
  href: string;
  iconName?: string;
  title: string;
}> = ({ href, iconName, title, collapsed }) => (
  <>
    <NavLink to={href}>
      {iconName && <Icon type={iconName} />}
      {!collapsed ? ` ${title}` : null}
    </NavLink>
    {collapsed ? <span>{title}</span> : null}
  </>
);

const AppMenu: SFC<{
  collapsed: boolean;
  workspaces?: Array<Workspace>;
  datasets?: Array<{
    name: string;
    id: string;
  }>;
}> = ({ datasets, workspaces, collapsed }) => (
  <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
    <Menu.Item key="menu_start">
      <MenuItemContent
        collapsed={collapsed}
        href="/"
        iconName="appstore-o"
        title="Start"
      />
    </Menu.Item>
    <SubMenu
      key="sub1"
      title={
        <span>
          <Icon type="database" />
          {!collapsed ? ' Data' : null}
        </span>
      }
    >
      <Menu.Item key="menu_datasets">
        <MenuItemContent collapsed={collapsed} href="/data" title="Datasets" />
      </Menu.Item>
      {datasets && datasets.length > 0 && <Menu.Divider />}
      {datasets &&
        datasets.map((ds: { name: string; id: string }) => (
          <Menu.Item key={`menu_passages+${ds.id}`}>
            <NavLink to={`/data/${ds.id}`}>{ds.name}</NavLink>
          </Menu.Item>
        ))}
    </SubMenu>
    <SubMenu
      key="sub2"
      title={
        <span>
          <Icon type="filter" />
          {!collapsed ? ' Explorer' : null}
        </span>
      }
    >
      <Menu.Item key="menu_workspaces">
        <MenuItemContent
          collapsed={collapsed}
          href="/workspaces"
          title="Workspaces"
        />
      </Menu.Item>
      {workspaces && workspaces.length > 0 && <Menu.Divider />}
      {workspaces &&
        workspaces.map((ws: { name: string; id: string }) => (
          <Menu.Item key={`menu_ws+${ws.id}`}>
            <NavLink to={`/workspaces/${ws.id}`}>{ws.name}</NavLink>
          </Menu.Item>
        ))}
    </SubMenu>
    <Menu.Item key="menu_vis">
      <MenuItemContent
        collapsed={collapsed}
        href="/visualizations"
        iconName="area-chart"
        title="Visualizations"
      />
    </Menu.Item>
  </Menu>
);

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
          <div className="logo" {...css({ color: '#CCC', padding: '24px' })}>
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
                  datasets={res.data!.datasets}
                  workspaces={res.data!.workspaces}
                  collapsed={collapsed}
                />
              );
            }}
          </Query>
        </Sider>
        <Layout>
          <Content {...css({ background: '#ECECEC', padding: '30px' })}>
            <Switch>
              <Route exact path="/" component={StartPage} />
              <Route exact path="/data" component={DataPage} />
              <Route path="/data/:id" component={DataDetailPage} />
              <Route
                exact
                path="/workspaces"
                component={WorkspacesOverviewPage}
              />
              <Route path="/workspaces/:id" component={WorkspaceDetailPage} />
              <Route exact path="/visualizations" component={VisPage} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Florian Richter</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(App);
