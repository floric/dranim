import * as React from 'react';
import { InputNumber } from 'antd';
import { NodeOptions } from '../AllNodes';
import { NumberSocket, OutputSocketInformation, NUMBER_TYPE } from '../Sockets';
import FormItem from 'antd/lib/form/FormItem';
import { getOrDefault } from '../utils';

export const NumberInputNode: NodeOptions = {
  title: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number', 'output')],
  path: ['Number'],
  keywords: [],
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['Number', { dataType: NUMBER_TYPE }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <FormItem label="Value">
      {getFieldDecorator('value', {
        rules: [{ required: true, type: 'number' }],
        initialValue: getOrDefault<number>(form, 'value', 0)
      })(<InputNumber />)}
    </FormItem>
  )
};
