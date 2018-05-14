import * as React from 'react';
import { InputNumber, Select, Form, Checkbox } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, STRING_TYPE } from '../Sockets';
import { getOrDefault } from '../utils';

export const FormatNumberNode: ClientNodeDef = {
  title: 'Format Number',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Formatted', { dataType: STRING_TYPE }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => {
    const optMantissa = getOrDefault<boolean>(form, 'opt-mantissa', true);
    const thousandsSeparated = getOrDefault<boolean>(
      form,
      'thousands-separated',
      true
    );
    const average = getOrDefault<boolean>(form, 'average', true);
    const avgSpace = getOrDefault<boolean>(form, 'average-space', true);

    return (
      <>
        <Form.Item label="Thousands separated">
          {getFieldDecorator('thousands-separated', {
            initialValue: thousandsSeparated
          })(<Checkbox defaultChecked={thousandsSeparated} />)}
        </Form.Item>
        <Form.Item label="Mantissa">
          {getFieldDecorator('mantissa', {
            initialValue: getOrDefault<number>(form, 'mantissa', 1)
          })(<InputNumber />)}
        </Form.Item>
        <Form.Item label="Optional mantissa">
          {getFieldDecorator('opt-mantissa', { initialValue: optMantissa })(
            <Checkbox defaultChecked={optMantissa} />
          )}
        </Form.Item>
        <Form.Item label="Average">
          {getFieldDecorator('average', { initialValue: average })(
            <Checkbox defaultChecked={average} />
          )}
        </Form.Item>
        <Form.Item label="Space separated">
          {getFieldDecorator('average-space', { initialValue: avgSpace })(
            <Checkbox defaultChecked={avgSpace} />
          )}
        </Form.Item>
        <Form.Item label="Total length">
          {getFieldDecorator('average-total', {
            initialValue: getOrDefault<number>(form, 'average-total', 1)
          })(<InputNumber />)}
        </Form.Item>
        <Form.Item label="Output">
          {getFieldDecorator('output', {
            initialValue: getOrDefault<string>(form, 'output', 'ordinal')
          })(
            <Select style={{ width: 200 }} placeholder="Output">
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
