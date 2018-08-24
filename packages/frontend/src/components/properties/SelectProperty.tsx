import { Select } from 'antd';
import * as React from 'react';
import { Property } from './Property';

export interface SelectPropertyProps {
  onChange: (value: string) => void;
  text: string;
  defaultValue?: string;
  options: Array<string>;
}

export const SelectProperty: React.SFC<SelectPropertyProps> = ({
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
