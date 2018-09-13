import React, { SFC } from 'react';

import { Col, Row, Tooltip } from 'antd';
import moment from 'moment';

export interface ProcessTimeProps {
  start: string;
  finish?: string;
}

export const ProcessTime: SFC<ProcessTimeProps> = ({ start, finish }) => (
  <>
    <Row>
      <Col xs={6}>Started:</Col>
      <Col xs={18}>
        <Tooltip title={start}>{moment(start).toNow()}</Tooltip>
      </Col>
    </Row>
    {finish ? (
      <Row>
        <Col xs={6}>Duration:</Col>
        <Col xs={18}>
          <Tooltip title={finish}>
            {moment(finish).to(moment(start), false)}
          </Tooltip>
        </Col>
      </Row>
    ) : null}
  </>
);
