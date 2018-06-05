import {
  FormatNumberNodeDef,
  FormatNumberNodeForm,
  FormatNumberNodeInputs,
  FormatNumberNodeOutputs
} from '@masterthesis/shared';
import { Checkbox, Form, InputNumber, Select } from 'antd';
import * as React from 'react';

import { ClientNodeDef } from '../all-nodes';
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

    const outputOptions = [
      { key: 'number', display: 'Number' },
      { key: 'ordinal', display: 'Ordinal' },
      { key: 'byte', display: 'Bytes' },
      { key: 'percent', display: 'Percentage' },
      { key: 'time', display: 'Time from seconds' }
    ];

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
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select output type"
            >
              {outputOptions.map(ds => (
                <Select.Option value={ds.key} key={ds.key}>
                  {ds.display}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </>
    );
  }
};
