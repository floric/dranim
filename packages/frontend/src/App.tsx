import * as React from 'react';
import { SFC } from 'react';

import { Switch, Route, NavLink, RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Icon, Layout, Menu } from 'antd';
import { css } from 'glamor';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import StartPage from './pages/StartPage';
import DataPage from './pages/DataPage';
import ExplorerPage from './pages/ExplorerPage';
import VisPage from './pages/VisPage';
import DataDetailPage from './pages/DataDetailPage';

const { Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

export interface IAppProps extends RouteComponentProps<{}> {}

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
  datasets?: Array<{
    name: string;
    id: string;
  }>;
}> = ({ datasets, collapsed }) => (
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
          <Icon type="user" />
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
    <Menu.Item key="menu_explorer">
      <MenuItemContent
        collapsed={collapsed}
        href="/explorer"
        iconName="filter"
        title="Explorer"
      />
    </Menu.Item>
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
                <AppMenu datasets={res.data!.datasets} collapsed={collapsed} />
              );
            }}
          </Query>
        </Sider>
        <Layout>
          <Content {...css({ background: '#ECECEC', padding: '30px' })}>
            <Switch>
              <Route exact path="/" render={props => StartPage} />
              <Route exact path="/data" render={props => DataPage} />
              <Route path="/data/:id" render={props => DataDetailPage} />
              <Route path="/explorer" render={props => ExplorerPage} />
              <Route path="/visualizations" render={props => VisPage} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Florian Richter</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(App);
