import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface NumberInfoProps {
  total: number;
  title: string;
}

export const NumberInfo: SFC<NumberInfoProps> = ({ total, title }) => (
  <>
    <Row>
      <Col>{title}</Col>
    </Row>
    <Row>
      <Col>{total.toLocaleString()}</Col>
    </Row>
  </>
);
