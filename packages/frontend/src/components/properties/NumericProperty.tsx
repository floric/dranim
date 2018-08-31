import React, { SFC } from 'react';

import { Input } from 'antd';
import { Property } from './Property';

export interface NumericPropertyProps {
  onChange: (value: number) => void;
  text: string;
  defaultValue?: number;
  unit?: string;
}

export const NumericProperty: SFC<NumericPropertyProps> = ({
  text,
  unit = 'px',
  onChange,
  defaultValue = 500
}) => (
  <Property text={text}>
    <Input
      defaultValue={defaultValue.toString()}
      style={{ maxWidth: '20rem' }}
      onChange={ev => {
        const val = Number.parseFloat(ev.target.value);
        onChange(Number.isNaN(val) ? defaultValue : val);
      }}
      addonAfter={unit}
    />
  </Property>
);
