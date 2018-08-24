import { Col, Row } from 'antd';
import * as React from 'react';

export interface PropertyProps {
  text: string;
}

export const Property: React.SFC<PropertyProps> = ({ text, children }) => (
  <Row align="middle" type="flex">
    <Col xs={12}>{text}</Col>
    <Col xs={12}>{children}</Col>
  </Row>
);
