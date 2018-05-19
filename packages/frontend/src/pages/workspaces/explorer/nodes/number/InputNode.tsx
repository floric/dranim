import * as React from 'react';
import { InputNumber, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation } from '../Sockets';
import { getOrDefault, formToMap, DataType } from '@masterthesis/shared';

export const NumberInputNode: ClientNodeDef = {
  title: 'Number Input',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Number', { dataType: DataType.NUMBER }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        rules: [{ required: true, type: 'number' }],
        initialValue: getOrDefault<number>(formToMap(form), 'value', 0)
      })(<InputNumber />)}
    </Form.Item>
  )
};
