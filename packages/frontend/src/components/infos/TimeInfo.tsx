import React, { SFC } from 'react';

import { Col, Row, Tooltip } from 'antd';
import moment from 'moment';

export interface TimeInfoProps {
  text: string;
  time: string;
}

export const TimeInfo: SFC<TimeInfoProps> = ({ text, time }) => (
  <Row type="flex" justify="space-between">
    <Col>
      {text}
      :&nbsp;
    </Col>
    <Col>
      <Tooltip title={time}>{moment(time).fromNow()}</Tooltip>
    </Col>
  </Row>
);
