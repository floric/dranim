import * as React from 'react';
import { InputNumber, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, NUMBER_TYPE } from '../Sockets';
import { getOrDefault } from '../utils';

export const NumberInputNode: ClientNodeDef = {
  title: 'Number Input',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Number', { dataType: NUMBER_TYPE }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        rules: [{ required: true, type: 'number' }],
        initialValue: getOrDefault<number>(form, 'value', 0)
      })(<InputNumber />)}
    </Form.Item>
  )
};
