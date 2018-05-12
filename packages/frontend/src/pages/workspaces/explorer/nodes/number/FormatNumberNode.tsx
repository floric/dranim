import * as React from 'react';
import { Input, Form } from 'antd';
import { NodeDef } from '../AllNodes';
import {
  NumberSocket,
  StringSocket,
  OutputSocketInformation,
  STRING_TYPE
} from '../Sockets';

export const FormatNumberNode: NodeDef = {
  title: 'Format Number',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [StringSocket('Formatted', 'output')],
  path: ['Number', 'Converters'],
  keywords: [],
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
