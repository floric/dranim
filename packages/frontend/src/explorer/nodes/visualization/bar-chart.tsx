import * as React from 'react';

import {
  OutputResult,
  VisBarChartDef,
  VisBarChartForm,
  VisBarChartType,
  VisInputs
} from '@masterthesis/shared';
import { Form, Select } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const VisBarChartNode: ClientNodeDef<
  VisInputs,
  OutputResult,
  VisBarChartForm
> = {
  type: VisBarChartDef.type,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Type">
      {getFieldDecorator('type', {
        rules: [{ required: true }],
        initialValue: getValueOrDefault(nodeForm, 'type', VisBarChartType.BAR)
      })(
        <Select showSearch style={{ width: 200 }} placeholder="Select Type">
          {Object.values(VisBarChartType).map(type => (
            <Select.Option value={type} key={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  )
};
