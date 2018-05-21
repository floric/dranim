import * as React from 'react';
import { InputNumber, Select, Form, Checkbox } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  FormatNumberNodeDef,
  FormatNumberNodeForm,
  FormatNumberNodeInputs,
  FormatNumberNodeOutputs
} from '@masterthesis/shared';

export const FormatNumberNode: ClientNodeDef<
  FormatNumberNodeInputs,
  FormatNumberNodeOutputs,
  FormatNumberNodeForm
> = {
  name: FormatNumberNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => {
    return (
      <>
        <Form.Item label="Thousands separated">
          {getFieldDecorator('thousands-separated', {
            initialValue: nodeForm.thousandsSeparated || true
          })(<Checkbox defaultChecked={nodeForm.thousandsSeparated || true} />)}
        </Form.Item>
        <Form.Item label="Mantissa">
          {getFieldDecorator('mantissa', {
            initialValue: nodeForm.mantissa || 0
          })(<InputNumber />)}
        </Form.Item>
        <Form.Item label="Optional mantissa">
          {getFieldDecorator('opt-mantissa', {
            initialValue: nodeForm.optMantissa || true
          })(<Checkbox defaultChecked={nodeForm.optMantissa || true} />)}
        </Form.Item>
        <Form.Item label="Average">
          {getFieldDecorator('average', {
            initialValue: nodeForm.average || true
          })(<Checkbox defaultChecked={nodeForm.average || true} />)}
        </Form.Item>
        <Form.Item label="Space separated">
          {getFieldDecorator('space-separated', {
            initialValue: nodeForm.spaceSeparated || true
          })(<Checkbox defaultChecked={nodeForm.spaceSeparated || true} />)}
        </Form.Item>
        <Form.Item label="Total length">
          {getFieldDecorator('average-total', {
            initialValue: nodeForm.averageTotal || 3
          })(<InputNumber />)}
        </Form.Item>
        <Form.Item label="Output">
          {getFieldDecorator('output', {
            initialValue: nodeForm.output || 'number'
          })(
            <Select style={{ width: 200 }} placeholder="Output">
              <Select.Option value="number" key="number">
                Number
              </Select.Option>
              <Select.Option value="ordinal" key="ordinal">
                Ordinal
              </Select.Option>
              <Select.Option value="byte" key="byte">
                Bytes
              </Select.Option>
              <Select.Option value="percent" key="percent">
                Percentage
              </Select.Option>
              <Select.Option value="time" key="time">
                Time from seconds
              </Select.Option>
            </Select>
          )}
        </Form.Item>
      </>
    );
  }
};
