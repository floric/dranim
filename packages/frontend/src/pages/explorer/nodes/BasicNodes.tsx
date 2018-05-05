import * as React from 'react';
import { SFC } from 'react';
import { Input, Form, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { ExplorerEditorProps, NodeDef } from '../ExplorerEditor';
import {
  Socket,
  NumberSocket,
  StringSocket,
  OutputSocketInformation,
  NUMBER_TYPE,
  STRING_TYPE
} from './Sockets';
import { getOrDefault } from './utils';

const FormItem = Form.Item;

export interface EditorProps {
  x?: number;
  y?: number;
  nodeId: string;
}

export interface EditorContext {
  state: ExplorerEditorProps;
  node: NodeDef;
  inputs: Map<string, OutputSocketInformation>;
}

export interface NodeOptions {
  title: string;
  inputs: Array<Socket>;
  outputs: Array<Socket>;
  path: Array<string>;
  keywords: Array<string>;
  form?: SFC<FormComponentProps & EditorContext>;
  onClientExecution: (
    inputs: Map<string, OutputSocketInformation>,
    context: EditorContext
  ) => Map<string, OutputSocketInformation>;
}

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
  form: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form layout="inline" hideRequiredMark>
      <FormItem label="Value">
        {getFieldDecorator('value', {
          rules: [{ required: true, type: 'number' }],
          initialValue: getOrDefault<number>(form, 'value', 0)
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

export const NumberOutputNode: NodeOptions = {
  title: 'Number Output',
  inputs: [NumberSocket('Number', 'input')],
  outputs: [],
  path: ['Number'],
  keywords: [],
  onClientExecution: () => new Map()
};

export const StringOutputNode: NodeOptions = {
  title: 'String Output',
  inputs: [StringSocket('String', 'input')],
  outputs: [],
  path: ['String'],
  keywords: [],
  onClientExecution: () => new Map()
};

export const AllBasicNodes = [
  NumberInputNode,
  StringInputNode,
  NumberOutputNode,
  StringOutputNode
];
