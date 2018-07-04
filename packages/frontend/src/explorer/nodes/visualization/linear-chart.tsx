import * as React from 'react';

import {
  LinearChartDef,
  LinearChartForm,
  LinearChartType,
  OutputResult,
  VisInputs
} from '@masterthesis/shared';
import { Form, Select } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const LinearChartNode: ClientNodeDef<
  VisInputs,
  OutputResult,
  LinearChartForm
> = {
  type: LinearChartDef.type,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Type">
      {getFieldDecorator('type', {
        rules: [{ required: true }],
        initialValue: getValueOrDefault(nodeForm, 'type', LinearChartType.BAR)
      })(
        <Select showSearch style={{ width: 200 }} placeholder="Select Type">
          {Object.values(LinearChartType).map(type => (
            <Select.Option value={type} key={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  )
};
