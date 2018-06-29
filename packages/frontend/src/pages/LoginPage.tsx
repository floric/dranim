import * as React from 'react';

import { Colors } from '@masterthesis/shared';
import { Card, Col, Layout, Row } from 'antd';

import { LoginForm } from './forms/LoginForm';

export default class LoginPage extends React.Component<{}> {
  public render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Content style={{ background: Colors.Background }}>
          <Row>
            <Col span={12} offset={6}>
              <h1>Login</h1>
              <Card bordered={false}>
                <LoginForm />
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}
