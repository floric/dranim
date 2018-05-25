import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface INumberInfoProps {
  total: number;
  title: string;
}

export const NumberInfo: SFC<INumberInfoProps> = ({ total, title }) => (
  <>
    <Row>
      <Col>{title}</Col>
    </Row>
    <Row>
      <Col>{total.toLocaleString()}</Col>
    </Row>
  </>
);
