import * as React from 'react';
import { SFC } from 'react';

import { Col, Slider } from 'antd';

export interface SliderColProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export const SliderCol: SFC<SliderColProps> = ({
  label,
  min,
  max,
  value,
  onChange
}) => (
  <Col xs={24} sm={12} md={6} lg={3}>
    <p>{label}</p>
    <Slider min={min} max={max} defaultValue={value} onChange={onChange} />
  </Col>
);
