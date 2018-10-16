import React, { SFC } from 'react';

import { Colors } from '@masterthesis/shared';
import { Alert, Col, Divider, Icon, Row } from 'antd';

export interface WarningProps {
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
}

export const Warning: SFC<WarningProps> = ({
  message,
  title,
  type = 'warning'
}) => <Alert message={title} description={message} type={type} />;

export const NoDatasetInputWarning: SFC = () => (
  <Warning title="No Table present" message="Please input a valid Table." />
);

export interface SubtleWarningProps {
  type: 'warning' | 'error' | 'info' | 'success' | string;
}

const colors = {
  warning: Colors.Warning,
  error: Colors.Error,
  success: Colors.Success
};

export const SubtleWarning: SFC<SubtleWarningProps> = ({
  type = 'warning',
  children
}) => (
  <Row
    type="flex"
    justify="start"
    align="middle"
    style={{ flexWrap: 'nowrap' }}
  >
    <Col>
      <Icon type={type} style={{ color: colors[type] }} />
    </Col>
    <Col>
      <Divider type="vertical" />
    </Col>
    <Col>{children}</Col>
  </Row>
);
