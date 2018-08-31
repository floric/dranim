import React, { SFC } from 'react';

import { Col, Row } from 'antd';

export interface StringInfoProps {
  value: string;
}

export const StringInfo: SFC<StringInfoProps> = ({ value }) => (
  <Row>
    <Col>{value}</Col>
  </Row>
);
