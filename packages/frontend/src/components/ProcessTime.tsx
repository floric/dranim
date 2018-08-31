import React, { SFC } from 'react';

import { Col, Row, Tooltip } from 'antd';
import { distanceInWords, distanceInWordsToNow } from 'date-fns';

export interface ProcessTimeProps {
  start: string;
  finish?: string;
}

export const ProcessTime: SFC<ProcessTimeProps> = ({ start, finish }) => (
  <>
    <Row>
      <Col xs={6}>Started:</Col>
      <Col xs={18}>
        <Tooltip title={start}>
          {distanceInWordsToNow(start, {
            includeSeconds: true,
            addSuffix: true
          })}
        </Tooltip>
      </Col>
    </Row>
    {finish ? (
      <Row>
        <Col xs={6}>Duration:</Col>
        <Col xs={18}>
          <Tooltip title={finish}>
            {distanceInWords(finish, start, {
              includeSeconds: true
            })}
          </Tooltip>
        </Col>
      </Row>
    ) : null}
  </>
);
