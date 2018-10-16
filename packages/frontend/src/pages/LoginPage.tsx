import React, { Component } from 'react';

import { Colors } from '@masterthesis/shared';
import { Card, Col, Layout, Row } from 'antd';
import { Link, RouteComponentProps } from 'react-router-dom';

import { Footer } from '../components/layout/Footer';
import { resetCache } from '../io/auth';
import { LoginForm } from './forms/LoginForm';

const FLEX_SIZE = {
  xs: {
    span: 24,
    offset: 0
  },
  md: {
    span: 12,
    offset: 6
  }
};

export interface LoginPageProps extends RouteComponentProps<{}> {}

class LoginPage extends Component<LoginPageProps> {
  public componentWillMount() {
    resetCache();
  }

  public render() {
    const { history } = this.props;
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Content style={{ background: Colors.Background }}>
          <Row>
            <Col {...FLEX_SIZE}>
              <Card bordered={false}>
                <h1>Login</h1>
                <p>
                  Please login to access draniM or{' '}
                  <Link to="/registration">create your account</Link> first.
                </p>
                <LoginForm history={history} />
              </Card>
            </Col>
          </Row>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }
}

export default LoginPage;
