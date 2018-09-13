import React, { SFC } from 'react';

import { Alert } from 'antd';

export interface WarningProps {
  title: string;
  message: string;
}

export const Warning: SFC<WarningProps> = ({ message, title }) => (
  <Alert message={title} description={message} type="warning" />
);

export const NoDatasetInputWarning: SFC = () => (
  <Warning title="No Dataset present" message="Please input a valid Dataset." />
);
