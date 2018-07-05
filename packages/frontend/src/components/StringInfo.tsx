import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface StringInfoProps {
  value: string;
}

export const StringInfo: SFC<StringInfoProps> = ({ value }) => (
  <Row>
    <Col>{value}</Col>
  </Row>
);
