import React, { SFC } from 'react';

import { Row } from 'antd';

export const CardsLayout: SFC = ({ children }) => (
  <Row gutter={12} style={{ marginBottom: '1rem' }}>
    {children}
  </Row>
);

export const cardItemProps = {
  xs: { span: 24 },
  md: { span: 12 },
  xl: { span: 8 },
  style: { marginBottom: '1rem' }
};
