import * as React from 'react';
import { Input, Form } from 'antd';
import { NodeOptions } from '../AllNodes';
import {
  NumberSocket,
  StringSocket,
  OutputSocketInformation,
  STRING_TYPE
} from '../Sockets';
import FormItem from 'antd/lib/form/FormItem';

export const FormatNumberNode: NodeOptions = {
  title: 'Format Number',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [StringSocket('Formatted', 'output')],
  path: ['Number', 'Converters'],
  keywords: [],
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Formatted', { dataType: STRING_TYPE }]
    ]),
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
