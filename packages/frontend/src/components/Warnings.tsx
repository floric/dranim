import React, { SFC } from 'react';

import { Alert } from 'antd';

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
  <Warning title="No Dataset present" message="Please input a valid Dataset." />
);
