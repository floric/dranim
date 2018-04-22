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

const ALL_DATASETS = gql`
  {
    datasets {
      _id
      name
    }
  }
`;

const AppMenu: SFC<{
  datasets?: Array<{
    name: string;
    _id: string;
  }>;
}> = ({ datasets }) => (
  <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
    <Menu.Item key="menu_start">
      <NavLink to="/">
        <Icon type="appstore-o" /> Start
      </NavLink>
    </Menu.Item>
    <SubMenu
      key="sub1"
      title={
        <span>
          <Icon type="user" /> Data
        </span>
      }
    >
      <Menu.Item key="menu_datasets">
        <NavLink to="/data">Datasets</NavLink>
      </Menu.Item>
      {datasets && datasets.length > 0 && <Menu.Divider />}
      {datasets &&
        datasets.map((ds: { name: string; _id: string }) => (
          <Menu.Item key={`menu_passages+${ds._id}`}>
            <NavLink to={`/data/${ds._id}`}>{ds.name}</NavLink>
          </Menu.Item>
        ))}
    </SubMenu>
    <Menu.Item key="menu_explorer">
      <NavLink to="/explorer">
        <Icon type="filter" /> Explorer
      </NavLink>
    </Menu.Item>
    <Menu.Item key="menu_vis">
      <NavLink to="/visualizations">
        <Icon type="area-chart" /> Visualizations
      </NavLink>
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
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible={true}
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="logo" {...css({ color: '#CCC', padding: '24px' })}>
            <span {...css({ fontWeight: '900', fontSize: '150%' })}>
              Timeseries
            </span>
            <br />
            <span>Explorer</span>
          </div>
          <Query query={ALL_DATASETS} pollInterval={5000}>
            {res => {
              if (res.loading) {
                return <AppMenu />;
              }
              if (res.error) {
                return <AppMenu />;
              }

              return <AppMenu datasets={res.data!.datasets} />;
            }}
          </Query>
        </Sider>
        <Layout>
          <Content {...css({ background: '#ECECEC', padding: '30px' })}>
            <Switch>
              <Route exact={true} path="/" render={props => StartPage} />
              <Route exact={true} path="/data" render={props => DataPage} />
              <Route path="/data/:id" render={props => DataDetailPage} />
              <Route path="/explorer" render={props => ExplorerPage} />
              <Route path="/visualizations" render={props => VisPage} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Soundtoll Registers</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(App);
