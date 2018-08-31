import React, { SFC } from 'react';

import { Col, Row } from 'antd';

export interface PropertyProps {
  text: string;
}

export const Property: SFC<PropertyProps> = ({ text, children }) => (
  <Row align="middle" type="flex">
    <Col xs={12}>{text}</Col>
    <Col xs={12}>{children}</Col>
  </Row>
);
