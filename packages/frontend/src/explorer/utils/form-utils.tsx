import React, { SFC } from 'react';
import { Select } from 'antd';

export interface FormSelectProps {
  placeholder?: string;
  multiple?: boolean;
  values: Array<{ key: string; display?: string }>;
}

export const FormSelect: SFC<FormSelectProps> = ({
  placeholder = '',
  multiple = false,
  values
}) => (
  <Select
    mode={multiple ? 'multiple' : undefined}
    showSearch
    style={{ width: 200 }}
    placeholder={placeholder}
  >
    {values.map(ds => (
      <Select.Option value={ds.key} key={ds.key}>
        {ds.display ? ds.display : ds.key}
      </Select.Option>
    ))}
  </Select>
);
