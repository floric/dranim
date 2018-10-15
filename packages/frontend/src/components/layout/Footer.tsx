import React, { SFC } from 'react';

import { Col, Divider, Icon, Layout, Row } from 'antd';

export const Footer: SFC = () => (
  <Layout.Footer style={{ padding: 16 }}>
    <Row type="flex" justify="space-between">
      <Col />
      <Col>
        <Icon type="github" /> Source on{' '}
        <a
          href="https://github.com/floric/Masterthesis_Prototype"
          target="_href"
        >
          Github
        </a>{' '}
        <Divider type="vertical" /> Florian Richter, 2018{' '}
        <Divider type="vertical" /> This App uses cookies to store user
        sessions.
      </Col>
      <Col />
    </Row>
  </Layout.Footer>
);
