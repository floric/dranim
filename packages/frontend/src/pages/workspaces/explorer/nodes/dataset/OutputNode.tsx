import * as React from 'react';
import { Form, Input } from 'antd';

import { ClientNodeDef } from '../AllNodes';
import { getOrDefault } from '../../../../../utils/shared';

export const DatasetOutputNode: ClientNodeDef = {
  title: 'Dataset Output',
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
