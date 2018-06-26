import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface BooleanInfoProps {
  value: boolean;
  title: string;
}

export const BooleanInfo: SFC<BooleanInfoProps> = ({ value, title }) => (
  <>
    <Row>
      <Col>{title}</Col>
    </Row>
    <Row>
      <Col>{value ? <strong>TRUE</strong> : <strong>FALSE</strong>}</Col>
    </Row>
  </>
);
