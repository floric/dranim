import { Input } from 'antd';
import * as React from 'react';

export interface NumericPropertyProps {
  onChange: (value: number) => void;
  text: string;
  defaultValue?: number;
  unit?: string;
}

export const NumericProperty: React.SFC<NumericPropertyProps> = ({
  text,
  unit = 'px',
  onChange,
  defaultValue = 500
}) => (
  <>
    <Input
      addonBefore={text}
      defaultValue={defaultValue.toString()}
      style={{ maxWidth: '200px' }}
      onChange={ev => {
        const val = Number.parseInt(ev.target.value, 10);
        onChange(Number.isNaN(val) ? 0 : val);
      }}
      addonAfter={unit}
    />
  </>
);
