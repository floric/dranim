import * as React from 'react';
import { SFC } from 'react';
import { StringSocket, NumberSocket, Socket } from './Sockets';
import { Input, Form, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

const FormItem = Form.Item;

export interface EditorProps {
  x?: number;
  y?: number;
  nodeId: string;
}

export interface NodeOptions {
  title: string;
  inputs: Array<Socket>;
  outputs: Array<Socket>;
  path: Array<string>;
  keywords: Array<string>;
  form?: SFC<FormComponentProps>;
}

export const NumberInputNode: NodeOptions = {
  title: 'Number Input',
  inputs: [],
  outputs: [NumberSocket('Number', 'output')],
  path: ['Number'],
  keywords: [],
  form: ({ form: { getFieldDecorator } }) => (
    <Form layout="inline" hideRequiredMark>
      <FormItem label="Value">
        {getFieldDecorator('value', {
          rules: [{ required: true, type: 'number' }],
          initialValue: 0
        })(<InputNumber />)}
      </FormItem>
    </Form>
  )
};

export const StringInputNode: NodeOptions = {
  title: 'String Input',
  inputs: [],
  outputs: [StringSocket('String', 'output')],
  path: ['String'],
  keywords: [],
  form: ({ form: { getFieldDecorator } }) => (
    <Form layout="inline">
      <FormItem label="Value">{getFieldDecorator('value')(<Input />)}</FormItem>
    </Form>
  )
};

export const NumberOutputNode: NodeOptions = {
  title: 'Number Output',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [],
  path: ['Number'],
  keywords: []
};

export const StringOutputNode: NodeOptions = {
  title: 'String Output',
  inputs: [StringSocket('String', 'input')],
  outputs: [],
  path: ['String'],
  keywords: []
};

export const AllBasicNodes = [
  NumberInputNode,
  StringInputNode,
  NumberOutputNode,
  StringOutputNode
];
