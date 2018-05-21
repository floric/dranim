import * as React from 'react';
import { Form, Input } from 'antd';

import { ClientNodeDef } from '../AllNodes';
import {
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs,
  DatasetOutputNodeForm
} from '@masterthesis/shared';
import { getValueOrDefault } from '../utils';

export const DatasetOutputNode: ClientNodeDef<
  DatasetOutputNodeInputs,
  {},
  DatasetOutputNodeForm
> = {
  name: DatasetOutputNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Name">
      {getFieldDecorator('name', {
        rules: [{ required: true }],
        initialValue: getValueOrDefault(nodeForm, 'name', '')
      })(<Input />)}
    </Form.Item>
  )
};
