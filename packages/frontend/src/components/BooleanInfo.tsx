import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface BooleanInfoProps {
  value: boolean;
}

export const BooleanInfo: SFC<BooleanInfoProps> = ({ value }) => (
  <Row>
    <Col>{value ? <strong>TRUE</strong> : <strong>FALSE</strong>}</Col>
  </Row>
);
