import * as React from 'react';

import { Colors } from '@masterthesis/shared';
import { Card, Col, Layout, Row } from 'antd';
import { RouteComponentProps } from 'react-router';

import { LoginForm } from './forms/LoginForm';

export interface LoginPageProps extends RouteComponentProps<{}> {}

export default class LoginPage extends React.Component<LoginPageProps> {
  public render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Content style={{ background: Colors.Background }}>
          <Row>
            <Col span={12} offset={6}>
              <h1>Login</h1>
              <Card bordered={false}>
                <LoginForm history={this.props.history} />
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}
