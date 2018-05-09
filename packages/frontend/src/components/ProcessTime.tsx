import * as React from 'react';
import { Row, Col, Tooltip } from 'antd';
import { SFC } from 'react';
import { distanceInWordsToNow, distanceInWords } from 'date-fns';

export interface IProcessTimeProps {
  start: string;
  finish?: string;
}

export const ProcessTime: SFC<IProcessTimeProps> = ({ start, finish }) => (
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
