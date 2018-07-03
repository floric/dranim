import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface NumberInfoProps {
  total: number;
  description: string;
}

export const NumberInfo: SFC<NumberInfoProps> = ({ total, description }) => (
  <>
    <Row>
      <Col>{total.toLocaleString()}</Col>
    </Row>
    <Row>
      <Col>{description}</Col>
    </Row>
  </>
);
