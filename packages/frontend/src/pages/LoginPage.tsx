import * as React from 'react';

import { Colors } from '@masterthesis/shared';
import { Card, Col, Layout, Row } from 'antd';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import { LoginForm } from './forms/LoginForm';

export interface LoginPageProps extends RouteComponentProps<{}> {}

export default class LoginPage extends React.Component<LoginPageProps> {
  public render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Content style={{ background: Colors.Background }}>
          <Row>
            <Col span={12} offset={6}>
              <Card bordered={false}>
                <h1>Login</h1>
                <p>
                  Please login to access draniM or{' '}
                  <Link to="/registration">create your account</Link> first.
                </p>
                <LoginForm history={this.props.history} />
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}
