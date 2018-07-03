import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface StringInfoProps {
  value: string;
  description: string;
}

export const StringInfo: SFC<StringInfoProps> = ({ value, description }) => (
  <>
    <Row>
      <Col>{value}</Col>
    </Row>
    <Row>
      <Col>{description}</Col>
    </Row>
  </>
);
