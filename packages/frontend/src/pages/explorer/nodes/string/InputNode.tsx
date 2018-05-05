import * as React from 'react';
import { Input, Form } from 'antd';
import { NodeOptions } from '../AllNodes';
import { StringSocket, OutputSocketInformation, STRING_TYPE } from '../Sockets';
import FormItem from 'antd/lib/form/FormItem';
import { getOrDefault } from '../utils';

export const StringInputNode: NodeOptions = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String', 'output')],
  path: ['String'],
  keywords: [],
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['String', { dataType: STRING_TYPE }]
    ]),
  form: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form layout="inline">
      <FormItem label="Value">
        {getFieldDecorator('value', {
          initialValue: getOrDefault<string>(form, 'value', '')
        })(<Input />)}
      </FormItem>
    </Form>
  )
};
