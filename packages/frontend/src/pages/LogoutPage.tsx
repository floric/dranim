import * as React from 'react';

import { Colors } from '@masterthesis/shared';
import { Col, Layout, Row } from 'antd';
import { History } from 'history';
import { RouteComponentProps } from 'react-router';

import { LoadingCard } from '../components/CustomCards';
import { logout } from '../io/auth';

export interface LogoutPageProps extends RouteComponentProps<{}> {}

export default class LogoutPage extends React.Component<LogoutPageProps> {
  public componentDidMount() {
    this.doLogout(this.props.history);
  }

  private doLogout = async (history: History) => {
    await logout();
    history.push('/');
  };

  public render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Content style={{ background: Colors.Background }}>
          <Row>
            <Col span={12} offset={6}>
              <h1>Logout</h1>
              <LoadingCard />
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}
