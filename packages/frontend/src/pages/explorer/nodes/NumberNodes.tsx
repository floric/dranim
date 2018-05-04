import * as React from 'react';
import { Input, Form } from 'antd';

import { StringSocket, NumberSocket } from './Sockets';
import { NodeOptions } from './BasicNodes';

const FormItem = Form.Item;

export const FormatNumberNode: NodeOptions = {
  title: 'Format Number',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [StringSocket('Formatted', 'output')],
  path: ['Number', 'Converters'],
  keywords: [],
  form: ({ form: { getFieldDecorator } }) => (
    <Form layout="inline" hideRequiredMark>
      <FormItem label="Format">
        {getFieldDecorator('format', {
          initialValue: '0.0',
          rules: [{ required: true }]
        })(<Input />)}
      </FormItem>
    </Form>
  )
};

export const AllNumberNodes = [FormatNumberNode];
