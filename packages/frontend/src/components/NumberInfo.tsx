import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface NumberInfoProps {
  total: number;
}

export const NumberInfo: SFC<NumberInfoProps> = ({ total }) => (
  <Row>
    <Col>{total.toLocaleString()}</Col>
  </Row>
);
