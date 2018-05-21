import * as React from 'react';
import { InputNumber, Select, Form, Checkbox } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  FormatNumberNodeDef,
  FormatNumberNodeForm,
  FormatNumberNodeInputs,
  FormatNumberNodeOutputs
} from '@masterthesis/shared';
import { getValueOrDefault } from '../utils';

export const FormatNumberNode: ClientNodeDef<
  FormatNumberNodeInputs,
  FormatNumberNodeOutputs,
  FormatNumberNodeForm
> = {
  name: FormatNumberNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => {
    const thousandsSeparated = getValueOrDefault(
      nodeForm,
      'thousandsSeparated',
      true
    );
    const mantissa = getValueOrDefault(nodeForm, 'mantissa', 3);
    const optMantissa = getValueOrDefault(nodeForm, 'optMantissa', true);
    const average = getValueOrDefault(nodeForm, 'average', true);
    const spaceSeparated = getValueOrDefault(nodeForm, 'spaceSeparated', true);
    const averageTotal = getValueOrDefault(nodeForm, 'averageTotal', 3);
    const output = getValueOrDefault(nodeForm, 'output', 'number');

    return (
      <>
        <Form.Item label="Thousands separated">
          {getFieldDecorator('thousandsSeparated', {
            initialValue: thousandsSeparated
          })(<Checkbox defaultChecked={thousandsSeparated} />)}
        </Form.Item>
        <Form.Item label="Mantissa">
          {getFieldDecorator('mantissa', {
            initialValue: mantissa
          })(<InputNumber />)}
        </Form.Item>
        <Form.Item label="Optional mantissa">
          {getFieldDecorator('optMantissa', {
            initialValue: optMantissa
          })(<Checkbox defaultChecked={optMantissa} />)}
        </Form.Item>
        <Form.Item label="Average">
          {getFieldDecorator('average', {
            initialValue: average
          })(<Checkbox defaultChecked={average} />)}
        </Form.Item>
        <Form.Item label="Space separated">
          {getFieldDecorator('spaceSeparated', {
            initialValue: spaceSeparated
          })(<Checkbox defaultChecked={spaceSeparated} />)}
        </Form.Item>
        <Form.Item label="Total length">
          {getFieldDecorator('averageTotal', {
            initialValue: averageTotal
          })(<InputNumber />)}
        </Form.Item>
        <Form.Item label="Output">
          {getFieldDecorator('output', {
            initialValue: output
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
