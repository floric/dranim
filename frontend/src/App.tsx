import * as React from 'react';

import { Icon, Layout, Menu } from 'antd';
import { css } from 'glamor';

import StartPage from './pages/StartPage';
import DataPage from './pages/DataPage';
import ExplorerPage from './pages/ExplorerPage';
import VisPage from './pages/VisPage';
import DataDetailPage from './pages/DataDetailPage';

import { Switch, Route, NavLink, RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { IRootState } from './state/reducers/root';
import { Dataset } from './model/dataset';

const { Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

export interface IAppProps extends RouteComponentProps<{}> {
  datasets: Map<string, Dataset>;
}

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
    console.log(this.props);
    const { datasets } = this.props;
    const datasetsArr = Array.from(datasets.values());

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible={true}
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="logo" {...css({ color: '#CCC', padding: '24px' })}>
            <span {...css({ fontWeight: '900', fontSize: '150%' })}>STR</span>
            <br />
            <span>Explorer</span>
          </div>
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
              {datasets.size > 0 && (
                <>
                  <Menu.Divider />
                  {datasetsArr.map(set => (
                    <Menu.Item key={`menu_passages+${set.id}`}>
                      <NavLink to={`/data/${set.id}`}>{set.name}</NavLink>
                    </Menu.Item>
                  ))}
                </>
              )}
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

const mapStateToProps = (state: IRootState) => ({
  datasets: state.data.datasets
});

export default withRouter(connect(mapStateToProps)(App));
