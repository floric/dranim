import * as React from 'react';
import { Input, Form } from 'antd';
import { NodeDef } from '../AllNodes';
import { StringSocket, OutputSocketInformation, STRING_TYPE } from '../Sockets';
import { getOrDefault } from '../utils';

export const StringInputNode: NodeDef = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String', 'output')],
  path: ['String'],
  keywords: [],
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['String', { dataType: STRING_TYPE }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: getOrDefault<string>(form, 'value', '')
      })(<Input />)}
    </Form.Item>
  )
};
