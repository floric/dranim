import * as React from 'react';

import { Col, Row, Tooltip } from 'antd';
import { distanceInWordsToNow } from 'date-fns';

export interface TimeInfoProps {
  text: string;
  time: string;
}

export const TimeInfo: React.SFC<TimeInfoProps> = ({ text, time }) => (
  <Row>
    <Col xs={6}>{text}:</Col>
    <Col xs={18}>
      <Tooltip title={time}>
        {distanceInWordsToNow(time, {
          includeSeconds: true,
          addSuffix: true
        })}
      </Tooltip>
    </Col>
  </Row>
);
