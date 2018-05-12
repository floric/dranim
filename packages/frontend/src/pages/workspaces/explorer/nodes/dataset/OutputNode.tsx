import * as React from 'react';
import { Form, Input } from 'antd';

import { DataSocket } from '../Sockets';
import { NodeDef } from '../AllNodes';
import { getOrDefault } from '../utils';

export const DatasetOutputNode: NodeDef = {
  title: 'Dataset Output',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [],
  path: ['Dataset'],
  keywords: [],
  onClientExecution: () => new Map(),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Name">
      {getFieldDecorator('name', {
        rules: [{ required: true }],
        initialValue: getOrDefault<string>(form, 'name', '')
      })(<Input />)}
    </Form.Item>
  )
};
