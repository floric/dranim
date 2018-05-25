import {
  DatasetOutputNodeDef,
  DatasetOutputNodeForm,
  DatasetOutputNodeInputs
} from '@masterthesis/shared';
import { Form, Input } from 'antd';
import * as React from 'react';

import { ClientNodeDef } from '../AllNodes';
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
