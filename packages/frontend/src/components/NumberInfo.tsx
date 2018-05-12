import * as React from 'react';
import { Row, Col } from 'antd';
import { SFC } from 'react';

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
