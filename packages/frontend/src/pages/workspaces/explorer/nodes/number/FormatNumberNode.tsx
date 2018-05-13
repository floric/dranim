import * as React from 'react';
import { Input, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, STRING_TYPE } from '../Sockets';

export const FormatNumberNode: ClientNodeDef = {
  title: 'Format Number',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Formatted', { dataType: STRING_TYPE }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator } }) => (
    <Form.Item label="Format">
      {getFieldDecorator('format', {
        initialValue: '0.0',
        rules: [{ required: true }]
      })(<Input />)}
    </Form.Item>
  )
};
