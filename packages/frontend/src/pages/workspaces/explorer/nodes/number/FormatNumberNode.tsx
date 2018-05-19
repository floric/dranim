import * as React from 'react';
import { InputNumber, Select, Form, Checkbox } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation } from '../Sockets';
import {
  getOrDefault,
  formToMap,
  DataType,
  FormatNumberNodeDef
} from '@masterthesis/shared';

export const FormatNumberNode: ClientNodeDef = {
  name: FormatNumberNodeDef.name,
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Formatted', { dataType: DataType.STRING }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => {
    const formMap = formToMap(form);
    const optMantissa = getOrDefault<boolean>(formMap, 'opt-mantissa', true);
    const thousandsSeparated = getOrDefault<boolean>(
      formMap,
      'thousands-separated',
      true
    );
    const average = getOrDefault<boolean>(formMap, 'average', true);
    const space = getOrDefault<boolean>(formMap, 'space-separated', true);

    return (
      <>
        <Form.Item label="Thousands separated">
          {getFieldDecorator('thousands-separated', {
            initialValue: thousandsSeparated
          })(<Checkbox defaultChecked={thousandsSeparated} />)}
        </Form.Item>
        <Form.Item label="Mantissa">
          {getFieldDecorator('mantissa', {
            initialValue: getOrDefault<number>(formMap, 'mantissa', 1)
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
          {getFieldDecorator('space-separated', { initialValue: space })(
            <Checkbox defaultChecked={space} />
          )}
        </Form.Item>
        <Form.Item label="Total length">
          {getFieldDecorator('average-total', {
            initialValue: getOrDefault<number>(formMap, 'average-total', 1)
          })(<InputNumber />)}
        </Form.Item>
        <Form.Item label="Output">
          {getFieldDecorator('output', {
            initialValue: getOrDefault<string>(formMap, 'output', 'number')
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
