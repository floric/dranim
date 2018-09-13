import React, { SFC } from 'react';

import { Col, Row, Tooltip } from 'antd';
import moment from 'moment';

export interface TimeInfoProps {
  text: string;
  time: string;
}

export const TimeInfo: SFC<TimeInfoProps> = ({ text, time }) => (
  <Row>
    <Col xs={6}>{text}:</Col>
    <Col xs={18}>
      <Tooltip title={time}>{moment(time).toNow()}</Tooltip>
    </Col>
  </Row>
);
