import React, { SFC } from 'react';

import { Select } from 'antd';
import { Property } from './Property';

export interface SelectPropertyProps {
  onChange: (value: string) => void;
  text: string;
  defaultValue?: string;
  options: Array<string>;
}

export const SelectProperty: SFC<SelectPropertyProps> = ({
  text,
  onChange,
  options,
  defaultValue = options[0]
}) => (
  <Property text={text}>
    <Select
      defaultValue={defaultValue}
      onChange={(val: string) => onChange(val)}
      style={{ width: '100%' }}
    >
      {options.map(o => (
        <Select.Option key={o}>{o}</Select.Option>
      ))}
    </Select>
  </Property>
);
