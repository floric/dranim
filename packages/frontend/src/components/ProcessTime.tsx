import React, { SFC } from 'react';

import { Col, Row, Tooltip } from 'antd';
import moment from 'moment';

export interface ProcessTimeProps {
  start: string;
  finish?: string;
}

export const ProcessTime: SFC<ProcessTimeProps> = ({ start, finish }) => {
  const startTime = moment(start);
  const duration = moment.duration(moment(finish).diff(moment(start)));
  return (
    <>
      <Row>
        <Col xs={6}>Started:</Col>
        <Col xs={18}>
          <Tooltip title={startTime.toISOString()}>
            {startTime.fromNow()}
          </Tooltip>
        </Col>
      </Row>
      {finish ? (
        <Row>
          <Col xs={6}>Duration:</Col>
          <Col xs={18}>
            <Tooltip title={`${duration.asSeconds()}s`}>
              {duration.humanize()}
            </Tooltip>
          </Col>
        </Row>
      ) : null}
    </>
  );
};
