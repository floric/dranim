import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface BooleanInfoProps {
  value: boolean;
  description: string;
}

export const BooleanInfo: SFC<BooleanInfoProps> = ({ value, description }) => (
  <>
    <Row>
      <Col>{value ? <strong>TRUE</strong> : <strong>FALSE</strong>}</Col>
    </Row>
    <Row>
      <Col>{description}</Col>
    </Row>
  </>
);
