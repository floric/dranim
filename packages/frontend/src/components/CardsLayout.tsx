import * as React from 'react';

import { Row } from 'antd';

export const CardsLayout: React.SFC<{}> = ({ children }) => (
  <Row gutter={12} style={{ marginBottom: 12 }}>
    {children}
  </Row>
);

export const cardItemProps = {
  xs: { span: 24 },
  md: { span: 12 },
  xl: { span: 8 },
  style: { marginBottom: 12 }
};
