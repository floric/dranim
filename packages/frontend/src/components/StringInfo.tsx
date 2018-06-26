import * as React from 'react';
import { SFC } from 'react';

import { Col, Row } from 'antd';

export interface StringInfoProps {
  value: string;
  title: string;
}

export const StringInfo: SFC<StringInfoProps> = ({ value, title }) => (
  <>
    <Row>
      <Col>{title}</Col>
    </Row>
    <Row>
      <Col>{value}</Col>
    </Row>
  </>
);
