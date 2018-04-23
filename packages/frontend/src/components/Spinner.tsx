import * as React from 'react';
import { SFC } from 'react';
import { Spin, Icon } from 'antd';
import { SpinProps } from 'antd/lib/spin';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export const Spinner: SFC<SpinProps> = props => (
  <Spin indicator={antIcon} {...props} />
);
